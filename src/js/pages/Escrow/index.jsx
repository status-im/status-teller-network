/* global web3 */
/* eslint-disable complexity */
import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import CancelEscrow from './components/CancelEscrow';
import CancelDispute from './components/CancelDispute';
// import CardEscrowSeller from './components/CardEscrowSeller';
// import CardEscrowBuyer from './components/CardEscrowBuyer';
import FundingEscrow from "./components/FundingEscrow";
import EscrowDetail from './components/EscrowDetail';
import OpenChat from './components/OpenChat';
import Profile from './components/Profile';
import OpenDispute from './components/OpenDispute';
import Loading from '../../components/Loading';
import ApproveTokenFunds from './components/ApproveTokenFunds';

import {zeroAddress, addressCompare} from '../../utils/address';
import { States, checkNotEnoughETH } from '../../utils/transaction';
import { toTokenDecimals } from '../../utils/numbers';

import escrowF from '../../features/escrow';
import network from '../../features/network';
import approval from '../../features/approval';
import arbitration from '../../features/arbitration';
import events from '../../features/events';
import prices from '../../features/prices';

import "./index.scss";
import { ARBITRATION_UNSOLVED } from '../../features/arbitration/constants';
import ErrorInformation from "../../components/ErrorInformation";

const {toBN} = web3.utils;

class Escrow extends Component {
  constructor(props) {
    super(props);
    this.loadData();
  }

  state = {
    showApproveFundsScreen: false
  };

  loadData() {
    this.props.getEscrow(this.props.escrowId);
    this.props.loadArbitration(this.props.escrowId);
    this.props.getSNTAllowance();
    this.props.updateBalances();
    this.props.getLastActivity(this.props.address);
    this.props.getFeeMilliPercent();

    if (this.props.escrow) this.props.getTokenAllowance(this.props.escrow.offer.asset);
  }

  showApproveScreen = () => {
    this.setState({showApproveFundsScreen: true});
  };

  componentDidUpdate(prevProps) {
    if ((prevProps.loading && !this.props.loading) || (prevProps.escrow === null && this.props.escrow !== null)) { // Reload allowance information
      this.props.getTokenAllowance(this.props.escrow.offer.asset);
    }
    if (this.props.escrow && !this.watching && !this.props.escrowEvents[this.props.escrowId]) {
      if (this.props.escrow.status === escrowF.helpers.tradeStates.funded ||
        this.props.escrow.status === escrowF.helpers.tradeStates.arbitration_open ||
        this.props.escrow.status === escrowF.helpers.tradeStates.paid ||
        this.props.escrow.status === escrowF.helpers.tradeStates.waiting) {
        this.watching = true;
        this.props.watchEscrow(this.props.escrowId);
      }
    }
  }

  calculateRequiredBalance = () => {
    const {escrow, feeMilliPercent} = this.props;

    const tokenAmount = toBN(toTokenDecimals(escrow.tokenAmount, escrow.token.decimals));
    const divider = 100 * (feeMilliPercent / 1000);
    const feeAmount =  tokenAmount.div(toBN(divider));

    // trade amount + fee
    return tokenAmount.add(feeAmount).toString();
  };

  handleApprove = (amount, token, tokenDecimals) => () => {
    this.props.approve(token, amount, tokenDecimals);
  };

  handleReset = token => () => {
    this.props.approve(token, '0');
  };

  getOffer = (escrow, isBuyer) => {
    const offer = escrow.offer;
    if(isBuyer){
      offer.user = escrow.seller;
    } else {
      offer.user = escrow.buyerInfo;
    }
    return offer;
  };

  render() {
    let {escrowId, escrow, arbitration, address, sntAllowance, tokenAllowance, loading, tokens, fundEscrow,
      cancelEscrow, releaseEscrow, payEscrow, rateTransaction, approvalTxHash, lastActivity,
      approvalError, cancelDispute, ethBalance, gasPrice, feeMilliPercent} = this.props;

    const {showApproveFundsScreen} = this.state;

    const isETH = escrow && addressCompare(escrow.offer.asset, zeroAddress);
    const isETHorSNT = escrow && (isETH || addressCompare(escrow.offer.asset, tokens.SNT.address));

    if (!escrow || (!sntAllowance && sntAllowance !== 0) || !arbitration || !arbitration.arbitration || (!isETHorSNT && !tokenAllowance && tokenAllowance !== 0)) {
      return <Loading page={true}/>;
    }

    if (escrow.releaseStatus === States.failed || escrow.payStatus === States.failed || escrow.rateStatus === States.failed || escrow.fundStatus === States.failed) {
      return <ErrorInformation transaction={true} cancel={() => this.props.resetStatus(escrowId)}/>;
    }

    if(loading) return <Loading mining={true} txHash={escrow.txHash || approvalTxHash}/>;

    const arbitrationDetails = arbitration.arbitration;

    const notEnoughETH = checkNotEnoughETH(gasPrice, ethBalance);
    const canRelay = escrowF.helpers.canRelay(lastActivity);

    const token = Object.keys(tokens).map(t => tokens[t]).find(x => addressCompare(x.address, escrow.offer.asset));
    const isBuyer = addressCompare(escrow.buyer, address);
    const offer = this.getOffer(escrow, isBuyer);
    offer.token = token;

    const requiredBalance = this.calculateRequiredBalance();
    const isTokenApproved = (tokenAllowance !== null && toBN(tokenAllowance).gte(toBN(requiredBalance)));
    const shouldResetToken = token.address !== zeroAddress && tokenAllowance !== null && toBN(tokenAllowance).gt(toBN(0)) && toBN(requiredBalance).lt(toBN(tokenAllowance));

    let showFundButton = isTokenApproved;

    // Show token approval UI
    if(showApproveFundsScreen) {
      if (approvalError) {
        return <ErrorInformation message={approvalError}
                                 retry={this.handleApprove(escrow.tokenAmount, token.address, token.decimals)}
                                 transaction={true} cancel={this.props.cancelApproval}/>;
      }
      if (escrow.offer.asset !== zeroAddress) { // A token
        if (!isTokenApproved || shouldResetToken) {
          return <ApproveTokenFunds token={token} handleApprove={this.handleApprove(escrow.tokenAmount, token.address, token.decimals)}
                                    handleReset={this.handleReset(token.address)} tokenAllowance={tokenAllowance}
                                    requiredToken={requiredBalance} shouldResetToken={shouldResetToken}/>;
        }
      } else { // ETH
        showFundButton = true;
      }
    }

    return (
      <div className="escrow">
        <FundingEscrow isActive={true} isBuyer={isBuyer} isDone={false}/>

        {/*{ isBuyer && <CardEscrowBuyer trade={escrow}*/}
        {/*                              payAction={payEscrow}*/}
        {/*                              rateTransaction={rateTransaction}*/}
        {/*                              arbitrationDetails={arbitrationDetails} /> }*/}

        {/*{ !isBuyer && <CardEscrowSeller tokens={tokens}*/}
        {/*                                trade={escrow}*/}
        {/*                                showFundButton={showFundButton}*/}
        {/*                                showApproveScreen={this.showApproveScreen}*/}
        {/*                                fundEscrow={fundEscrow}*/}
        {/*                                releaseEscrow={releaseEscrow}*/}
        {/*                                arbitrationDetails={arbitrationDetails}*/}
        {/*                                feeMilliPercent={feeMilliPercent}*/}
        {/*                                isETH={isETH}/> }*/}

        <EscrowDetail escrow={escrow} isBuyer={isBuyer} currentPrice={this.props.assetCurrentPrice} />
        <OpenChat statusContactCode={isBuyer ? escrow.seller.statusContactCode : escrow.buyerInfo.statusContactCode } withBuyer={!isBuyer} />
        <Profile withBuyer={!isBuyer} address={isBuyer ? escrow.offer.owner : escrow.buyer} />
        <hr />
        <CancelEscrow trade={escrow} cancelEscrow={cancelEscrow} isBuyer={isBuyer} notEnoughETH={notEnoughETH} canRelay={canRelay} lastActivity={lastActivity} isETHorSNT={isETHorSNT} />
        {(arbitrationDetails && arbitrationDetails.open && addressCompare(arbitrationDetails.openBy, address) && arbitrationDetails.result === ARBITRATION_UNSOLVED) && <CancelDispute trade={escrow} cancelDispute={cancelDispute} /> }
        {(!arbitrationDetails ||!arbitrationDetails.open) && <OpenDispute trade={escrow}  /> }
      </div>
    );
  }
}

Escrow.propTypes = {
  history: PropTypes.object,
  escrow: PropTypes.object,
  arbitration: PropTypes.object,
  escrowId: PropTypes.string,
  getEscrow: PropTypes.func,
  address: PropTypes.string,
  sntAllowance: PropTypes.string,
  approvalError: PropTypes.string,
  tokenAllowance: PropTypes.string,
  getSNTAllowance: PropTypes.func,
  getTokenAllowance: PropTypes.func,
  tokens: PropTypes.object,
  approve: PropTypes.func,
  loading: PropTypes.bool,
  fundEscrow: PropTypes.func,
  fundStatus: PropTypes.string,
  resetStatus: PropTypes.func,
  getFeeMilliPercent: PropTypes.func,
  releaseEscrow: PropTypes.func,
  payEscrow: PropTypes.func,
  approvalTxHash: PropTypes.string,
  cancelEscrow: PropTypes.func,
  cancelDispute: PropTypes.func,
  cancelApproval: PropTypes.func,
  updateBalances: PropTypes.func,
  rateTransaction: PropTypes.func,
  loadArbitration: PropTypes.func,
  watchEscrow: PropTypes.func,
  escrowEvents: PropTypes.object,
  assetCurrentPrice: PropTypes.object,
  lastActivity: PropTypes.number,
  getLastActivity: PropTypes.func,
  ethBalance: PropTypes.string,
  gasPrice: PropTypes.string,
  feeMilliPercent: PropTypes.string
};

const mapStateToProps = (state, props) => {
  const approvalLoading = approval.selectors.isLoading(state);
  const arbitrationLoading = arbitration.selectors.isLoading(state);
  const escrowId = props.match.params.id.toString();
  const theEscrow = escrowF.selectors.getEscrowById(state, escrowId);
  const address =  network.selectors.getAddress(state) || "";
  return {
    address,
    escrowId:  escrowId,
    escrow: theEscrow,
    arbitration: arbitration.selectors.getArbitration(state) || {},
    sntAllowance: approval.selectors.getSNTAllowance(state),
    tokenAllowance: approval.selectors.getTokenAllowance(state),
    approvalTxHash: approval.selectors.txHash(state),
    approvalError: approval.selectors.error(state),
    tokens: network.selectors.getTokens(state),
    loading: (theEscrow && (theEscrow.cancelStatus === States.pending || theEscrow.rateStatus === States.pending)) || approvalLoading || arbitrationLoading,
    escrowEvents: events.selectors.getEscrowEvents(state),
    lastActivity: escrowF.selectors.getLastActivity(state),
    assetCurrentPrice: (theEscrow && theEscrow.token) ? prices.selectors.getAssetPrice(state, theEscrow.token.symbol) : null,
    gasPrice: network.selectors.getNetworkGasPrice(state),
    feeMilliPercent: escrowF.selectors.feeMilliPercent(state),
    ethBalance: network.selectors.getBalance(state, 'ETH')
  };
};

export default connect(
  mapStateToProps,
  {
    getEscrow: escrowF.actions.getEscrow,
    getSNTAllowance: approval.actions.getSNTAllowance,
    getTokenAllowance: approval.actions.getTokenAllowance,
    getFeeMilliPercent: escrowF.actions.getFeeMilliPercent,
    approve: approval.actions.approve,
    cancelApproval: approval.actions.cancelApproval,
    fundEscrow: escrowF.actions.fundEscrow,
    resetStatus: escrowF.actions.resetStatus,
    releaseEscrow: escrowF.actions.releaseEscrow,
    payEscrow: escrowF.actions.payEscrow,
    cancelEscrow: escrowF.actions.cancelEscrow,
    updateBalances: network.actions.updateBalances,
    rateTransaction: escrowF.actions.rateTransaction,
    loadArbitration: arbitration.actions.loadArbitration,
    cancelDispute: arbitration.actions.cancelDispute,
    watchEscrow: escrowF.actions.watchEscrow,
    getLastActivity: escrowF.actions.getLastActivity
  }
)(withRouter(Escrow));
