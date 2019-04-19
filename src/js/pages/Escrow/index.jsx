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
import Profile from './components/Profile';
import OpenDispute from './components/OpenDispute';
import Loading from '../../components/Loading';
import ApproveSNTFunds from './components/ApproveSNTFunds';
import ApproveTokenFunds from './components/ApproveTokenFunds';

import {zeroAddress} from '../../utils/address';
import { States } from '../../utils/transaction';

import escrow from '../../features/escrow';
import network from '../../features/network';
import prices from '../../features/prices';
import approval from '../../features/approval';

import "./index.scss";

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
    props.updateBalances();

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
    let {escrow, fee, address, sntAllowance, tokenAllowance, loading, tokens, prices, fundEscrow, fundStatus, cancelEscrow, releaseEscrow, releaseStatus, payStatus, payEscrow, rateTransaction} = this.props;
    const {showApproveFundsScreen} = this.state;

    if(!escrow) return <Loading page={true} />;
    if(loading) return <Loading mining={true} />;

    const token = Object.keys(tokens).map(t => tokens[t]).find(x => toChecksumAddress(x.address) === toChecksumAddress(escrow.offer.asset));
    const isBuyer = escrow.buyer === address;
    const offer = this.getOffer(escrow, isBuyer);
    offer.token = token;

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

    return (
      <div className="escrow">
        { isBuyer && <CardEscrowBuyer trade={escrow}
                                      payStatus={payStatus}
                                      payAction={payEscrow}
                                      rateTransaction={rateTransaction} /> }

        { !isBuyer && <CardEscrowSeller  fundStatus={fundStatus}
                                        tokens={tokens}
                                        releaseStatus={releaseStatus}
                                        trade={escrow} 
                                        fee={fee} 
                                        showFundButton={showFundButton} 
                                        showApproveScreen={this.showApproveScreen} 
                                        fundEscrow={fundEscrow}
                                        releaseEscrow={releaseEscrow} /> }
                                                            
        <EscrowDetail escrow={escrow} />
        <Row className="bg-secondary py-4 mt-4">
          <Col>
            <h3 className="mb-3">You are trading with</h3>
            <Offer offer={offer} prices={prices}/>
          </Col>
        </Row>
        <OpenChat statusContactCode={offer.user.statusContactCode} withBuyer={!isBuyer} />
        <Profile withBuyer={!isBuyer} address={isBuyer ? escrow.offer.owner : escrow.buyer} />
        <hr />
        <CancelEscrow trade={escrow} cancelEscrow={cancelEscrow} />
        <OpenDispute trade={escrow} />
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
  payEscrow: PropTypes.func,
  cancelStatus: PropTypes.string,
  cancelEscrow: PropTypes.func,
  updateBalances: PropTypes.func,
  rateTransaction: PropTypes.func,
  prices: PropTypes.object
};

const mapStateToProps = (state, props) => {
  const cancelStatus = escrow.selectors.getCancelEscrowStatus(state);
  const approvalLoading = approval.selectors.isLoading(state);
  const ratingStatus = escrow.selectors.getRatingStatus(state);

  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: escrow.selectors.getEscrow(state),
    fee: escrow.selectors.getFee(state),
    sntAllowance: approval.selectors.getSNTAllowance(state),
    tokenAllowance: approval.selectors.getTokenAllowance(state),
    prices: prices.selectors.getPrices(state),
    tokens: network.selectors.getTokens(state),
    loading: cancelStatus === States.pending || ratingStatus === States.pending || approvalLoading,
    fundStatus: escrow.selectors.getFundEscrowStatus(state),
    releaseStatus: escrow.selectors.getReleaseEscrowStatus(state),
    payStatus: escrow.selectors.getPaidEscrowStatus(state),
    cancelStatus
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
    payEscrow: escrow.actions.payEscrow,
    cancelEscrow: escrow.actions.cancelEscrow,
    updateBalances: network.actions.updateBalances,
    rateTransaction: escrow.actions.rateTransaction
  }
)(withRouter(Escrow));
