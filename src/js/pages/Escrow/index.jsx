/* global web3 */
/* eslint-disable complexity */
import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Row, Col} from "reactstrap";

import Offer from '../../components/Offer';
import CancelEscrow from './components/CancelEscrow';
import CardEscrowSeller from './components/CardEscrowSeller';
import CardEscrowBuyer from './components/CardEscrowBuyer';
import EscrowDetail from './components/EscrowDetail';
import OpenChat from './components/OpenChat';
import OpenDispute from './components/OpenDispute';
import Loading from '../../components/Loading';
import ApproveSNTFunds from './components/ApproveSNTFunds';
import ApproveTokenFunds from './components/ApproveTokenFunds';

import {zeroAddress} from '../../utils/address';

import escrow from '../../features/escrow';
import network from '../../features/network';
import approval from '../../features/approval';

import { States } from '../../utils/transaction';

const {toBN, toChecksumAddress} = web3.utils;

class Escrow extends Component {
  componentDidMount(){
    this.loadData(this.props);
  }

  loadData(props){
    props.getEscrow(props.escrowId);
    props.getFee();
    props.getSNTAllowance();
    props.resetStatus();

    if(props.escrow) props.getTokenAllowance(props.escrow.offer.asset);
  }

  state = {
    showApproveFundsScreen: false
  }

  showApproveScreen = () => {
    this.setState({showApproveFundsScreen: true});
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.loading && !this.props.loading) || (prevProps.escrow === null && this.props.escrow !== null)) { // Reload allowance information
      this.loadData(this.props);
    }
  }

  calculateRequiredSNT = () => {
    const {escrow, tokens, fee} = this.props;
    const asset = Object.keys(tokens).map(t => tokens[t]).find(x => toChecksumAddress(x.address) === toChecksumAddress(escrow.offer.asset));

    if(toChecksumAddress(asset.address) !== toChecksumAddress(tokens.SNT.address)){
      return fee; // Only snt fee must be paid
    }

    // SNT trade amount + fee
    return toBN(fee).add(toBN(escrow.tradeAmount)).toString();
  }

  handleApprove = (amount, token) => () => {
    this.props.approve(token, amount);
  }

  handleReset = token => () => {
    this.props.approve(token, '0');
  }

  getOffer = (escrow, isBuyer) => {
    const offer = escrow.offer;
    if(isBuyer){
      offer.user = escrow.seller;
    } else {
      offer.user = escrow.buyerInfo;
    }
    return offer;
  }

  render() {
    let {escrow, fee, address, sntAllowance, tokenAllowance, loading, tokens, fundEscrow, fundStatus, releaseEscrow, releaseStatus, payStatus, payEscrow} = this.props;
    const {showApproveFundsScreen} = this.state;

    if(!escrow) return <Loading page={true} />;
    if(loading) return <Loading mining={true} />;

    const token = Object.keys(tokens).map(t => tokens[t]).find(x => toChecksumAddress(x.address) === toChecksumAddress(escrow.offer.asset));
    const isBuyer = escrow.buyer === address;
    const offer = this.getOffer(escrow, isBuyer);

    /* Move this logic inside CardEscrowSeller */
    const requiredSNT = this.calculateRequiredSNT();
    const isSNTapproved = toBN(sntAllowance).gte(toBN(requiredSNT));
    const shouldResetSNT = toBN(sntAllowance).gt(toBN(0)) && toBN(requiredSNT).lt(toBN(sntAllowance));
    
    const requiredToken = escrow.tradeAmount;
    const isTokenApproved = token.address === zeroAddress || (tokenAllowance !== null && toBN(tokenAllowance).gte(toBN(requiredToken)));
    const shouldResetToken = token.address !== zeroAddress && tokenAllowance !== null && toBN(tokenAllowance).gt(toBN(0)) && toBN(requiredToken).lt(toBN(tokenAllowance));

    let showFundButton = isSNTapproved && isTokenApproved;

    // Show token approval UI
    if(showApproveFundsScreen) {
      if (!isSNTapproved || shouldResetSNT) return <ApproveSNTFunds handleApprove={this.handleApprove(requiredSNT, tokens.SNT.address)} handleReset={this.handleReset(tokens.SNT.address)} sntAllowance={sntAllowance} requiredSNT={requiredSNT} shouldResetSNT={shouldResetSNT} />;
      
      if(escrow.offer.asset !== zeroAddress) { // A token
        if(toChecksumAddress(escrow.offer.asset) === toChecksumAddress(tokens.SNT.address)){
          showFundButton = true;
        } else {
          if(!isTokenApproved || shouldResetToken)  return <ApproveTokenFunds token={token} handleApprove={this.handleApprove(requiredToken, token.address)} handleReset={this.handleReset(token.address)} tokenAllowance={tokenAllowance} requiredToken={requiredToken} shouldResetToken={shouldResetToken} />;
          showFundButton = true;
        }
      } else { // ETH
        showFundButton = true;
      }
    }

    if(escrow.status === 'released' || escrow.status === 'paid') showFundButton = false;

    let showLoading = fundStatus === States.pending || releaseStatus === States.pending;

    /* end */

    return (
      <div className="escrow">
        { isBuyer && <CardEscrowBuyer   escrow={escrow} 
                                        showLoading={payStatus === States.pending}
                                        payAction={() => { payEscrow(escrow.escrowId); }}
                                        showWaiting={payStatus === States.success || escrow.status === 'released'}  /> }

        { !isBuyer && <CardEscrowSeller showLoading={showLoading} 
                                        showFunded={fundStatus === States.success} 
                                        showRating={releaseStatus === States.success || escrow.status === 'released'}
                                        escrow={escrow} 
                                        fee={fee} 
                                        showFundButton={showFundButton} 
                                        showApproveScreen={this.showApproveScreen} 
                                        fundAction={() => { fundEscrow(escrow, fee); } }
                                        releaseEscrow={() => { releaseEscrow(escrow.escrowId); }} /> }
                                                            
        <EscrowDetail escrow={escrow} />
        <Row className="bg-secondary py-4 mt-4">
          <Col>
            <h3 className="mb-3">You are trading with</h3>
            <Offer offer={offer}/>
          </Col>
        </Row>
        <OpenChat statusContactCode={offer.user.statusContactCode} />
        <CancelEscrow/>
        <OpenDispute/>
      </div>
    );
  }
}

Escrow.propTypes = {
  history: PropTypes.object,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  getEscrow: PropTypes.func,
  getFee: PropTypes.func,
  fee: PropTypes.string,
  address: PropTypes.string,
  sntAllowance: PropTypes.string,
  tokenAllowance: PropTypes.string,
  getSNTAllowance: PropTypes.func,
  getTokenAllowance: PropTypes.func,
  tokens: PropTypes.object,
  approve: PropTypes.func,
  loading: PropTypes.bool,
  fundEscrow: PropTypes.func,
  fundStatus: PropTypes.string,
  resetStatus: PropTypes.func,
  releaseStatus: PropTypes.string,
  releaseEscrow: PropTypes.func,
  payStatus: PropTypes.string,
  payEscrow: PropTypes.func

};

const mapStateToProps = (state, props) => {
  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: escrow.selectors.getEscrow(state),
    fee: escrow.selectors.getFee(state),
    sntAllowance: approval.selectors.getSNTAllowance(state),
    tokenAllowance: approval.selectors.getTokenAllowance(state),
    tokens: network.selectors.getTokens(state),
    loading: approval.selectors.isLoading(state),
    fundStatus: escrow.selectors.getFundEscrowStatus(state),
    releaseStatus: escrow.selectors.getReleaseEscrowStatus(state),
    payStatus: escrow.selectors.getPaidEscrowStatus(state)
  };
};

export default connect(
  mapStateToProps,
  {
    getEscrow: escrow.actions.getEscrow,
    getFee: escrow.actions.getFee,
    getSNTAllowance: approval.actions.getSNTAllowance,
    getTokenAllowance: approval.actions.getTokenAllowance,
    approve: approval.actions.approve,
    fundEscrow: escrow.actions.fundEscrow,
    resetStatus: escrow.actions.resetStatus,
    releaseEscrow: escrow.actions.releaseEscrow,
    payEscrow: escrow.actions.payEscrow
  }
)(withRouter(Escrow));
