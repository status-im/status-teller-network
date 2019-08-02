/* global web3 */
/* eslint-disable complexity */
import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import classnames from 'classnames';
import CancelEscrow from './components/CancelEscrow';
import CancelDispute from './components/CancelDispute';
import FundingEscrow from "./components/FundingEscrow";
import SendMoney from "./components/SendMoney";
import ReleaseFunds from "./components/ReleaseFunds";
import Done from "./components/Done";
import EscrowDetail from './components/EscrowDetail';
import OpenChat from './components/OpenChat';
import Profile from './components/Profile';
import OpenDispute from './components/OpenDispute';
import Loading from '../../components/Loading';
import ApproveTokenFunds from './components/ApproveTokenFunds';
import { ARBITRATION_UNSOLVED } from '../../features/arbitration/constants';
import ErrorInformation from "../../components/ErrorInformation";
import {Col, Row} from 'reactstrap';
import RoundedIcon from "../../ui/RoundedIcon";
import exclamationCircle from "../../../images/exclamation-circle.png";

import {zeroAddress, addressCompare} from '../../utils/address';
import {States, checkNotEnoughETH} from '../../utils/transaction';
import {toTokenDecimals, fromTokenDecimals} from '../../utils/numbers';

import escrowF from '../../features/escrow';
import network from '../../features/network';
import approval from '../../features/approval';
import arbitration from '../../features/arbitration';
import events from '../../features/events';
import prices from '../../features/prices';

import "./index.scss";

const {toBN} = web3.utils;

class Escrow extends Component {
  constructor(props) {
    super(props);
    this.loadData();
  }

  state = {
    showApproveFundsScreen: false,
    releaseAnyway: false
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
      approvalError, cancelDispute, ethBalance, gasPrice, feeMilliPercent, arbitrationTxHash} = this.props;

    const {showApproveFundsScreen} = this.state;

    const isETH = escrow && addressCompare(escrow.offer.asset, zeroAddress);
    const isETHorSNT = escrow && (isETH || addressCompare(escrow.offer.asset, tokens.SNT.address));

    if (!escrow || (!sntAllowance && sntAllowance !== 0) || !arbitration || !arbitration.arbitration || (!isETHorSNT && !tokenAllowance && tokenAllowance !== 0)) {
      return <Loading page={true}/>;
    }

    if (escrow.releaseStatus === States.failed || escrow.payStatus === States.failed || escrow.rateStatus === States.failed || escrow.fundStatus === States.failed) {
      return <ErrorInformation transaction={true} cancel={() => this.props.resetStatus(escrowId)}/>;
    }

    if(loading) return <Loading mining={true} txHash={escrow.txHash || approvalTxHash || arbitrationTxHash}/>;

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
    if(showApproveFundsScreen && escrow.fundStatus !== States.success && escrow.status === escrowF.helpers.tradeStates.waiting) {
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

    const feePercent = feeMilliPercent / 1000;
    const tokenAmount = toBN(toTokenDecimals(escrow.tokenAmount, escrow.token.decimals));
    const divider = 100 * (feeMilliPercent / 1000);
    const feeAmount =  tokenAmount.div(toBN(divider));
    const totalAmount = tokenAmount.add(feeAmount);

    const escrowAssetPrice = escrow.assetPrice / 100 * ((escrow.offer.margin / 100) + 1);
    const escrowFiatAmount = (escrow.tokenAmount * escrowAssetPrice).toFixed(2);

    const enoughBalance = toBN(escrow.token.balance ? toTokenDecimals(escrow.token.balance || 0, escrow.token.decimals) : 0).gte(totalAmount);

    return (<Fragment>
      {arbitrationDetails.open && <Row className="mt-4">
        <Col xs="2">
          <RoundedIcon image={exclamationCircle} bgColor="red"/>
        </Col>
        <Col xs="10 my-auto text-danger">
          This trade is in dispute
        </Col>
      </Row>}
      <div className={classnames("escrow", {'escrow-disabled': arbitrationDetails.open})}>
        <FundingEscrow
          isActive={escrow.fundStatus !== States.success && escrow.status === escrowF.helpers.tradeStates.waiting}
          isBuyer={isBuyer} disabled={arbitrationDetails.open}
          isDone={escrow.fundStatus === States.success || escrow.status === escrowF.helpers.tradeStates.funded ||
          escrow.status === escrowF.helpers.tradeStates.paid || escrow.status === escrowF.helpers.tradeStates.released}
          needsApproval={!showFundButton}
          enoughBalance={enoughBalance} feePercent={feePercent.toString()}
          feeAmount={fromTokenDecimals(feeAmount, escrow.token.decimals).toString()}
          tokenAmount={escrow.tokenAmount.toString()} tokenSymbol={escrow.token.symbol}
          action={!showFundButton ? this.showApproveScreen : () => fundEscrow(escrow)}/>

        <SendMoney
          isDone={escrow.status === escrowF.helpers.tradeStates.paid || escrow.status === escrowF.helpers.tradeStates.released}
          isActive={escrow.status === escrowF.helpers.tradeStates.funded && !this.state.releaseAnyway} isBuyer={isBuyer}
          fiatAmount={escrowFiatAmount.toString()} fiatSymbol={escrow.offer.currency} disabled={arbitrationDetails.open}
          action={() => {
            if (isBuyer) {
              return payEscrow(escrow.escrowId);
            }
            this.setState({releaseAnyway: true});
          }}/>

        <ReleaseFunds
          isActive={(this.state.releaseAnyway && escrow.status !== escrowF.helpers.tradeStates.released) || escrow.status === escrowF.helpers.tradeStates.paid}
          isDone={escrow.status === escrowF.helpers.tradeStates.released} isBuyer={isBuyer}
          disabled={arbitrationDetails.open}
          isPaid={escrow.status === escrowF.helpers.tradeStates.paid} action={() => releaseEscrow(escrow.escrowId)}/>

        <Done isDone={escrow.status === escrowF.helpers.tradeStates.released}
              isActive={escrow.status === escrowF.helpers.tradeStates.released}
              rateTransaction={rateTransaction} trade={escrow} isBuyer={isBuyer} rateStatus={escrow.rateStatus}/>
      </div>

      <EscrowDetail escrow={escrow} isBuyer={isBuyer} currentPrice={this.props.assetCurrentPrice}/>
      <OpenChat statusContactCode={isBuyer ? escrow.seller.statusContactCode : escrow.buyerInfo.statusContactCode}
                withBuyer={!isBuyer}/>
      <Profile withBuyer={!isBuyer} address={isBuyer ? escrow.offer.owner : escrow.buyer}/>
      <hr/>
      <CancelEscrow trade={escrow} cancelEscrow={cancelEscrow} isBuyer={isBuyer} notEnoughETH={notEnoughETH}
                    canRelay={canRelay} lastActivity={lastActivity} isETHorSNT={isETHorSNT}/>
      {(arbitrationDetails && arbitrationDetails.open && addressCompare(arbitrationDetails.openBy, address) && arbitrationDetails.result === ARBITRATION_UNSOLVED) &&
      <CancelDispute trade={escrow} cancelDispute={cancelDispute}/>}
      {(!arbitrationDetails || !arbitrationDetails.open) && <OpenDispute trade={escrow}/>}

      {/*Only show "See all options" button if there is a scroll bar*/}
      {window.innerHeight < document.getElementById('app-container').offsetHeight &&
      <div className="see-all-options" onClick={() => window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: 'smooth'
      })}>See all options ↓</div>}
    </Fragment>);
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
  arbitrationTxHash: PropTypes.string,
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
    arbitrationTxHash: arbitration.selectors.txHash(state),
    sntAllowance: approval.selectors.getSNTAllowance(state),
    tokenAllowance: approval.selectors.getTokenAllowance(state),
    approvalTxHash: approval.selectors.txHash(state),
    approvalError: approval.selectors.error(state),
    tokens: network.selectors.getTokens(state),
    loading: theEscrow && ((theEscrow.cancelStatus === States.pending || theEscrow.rateStatus === States.pending) ||
      approvalLoading || arbitrationLoading || (theEscrow.releaseStatus === States.pending ||
        (theEscrow.mining && (theEscrow.status === escrowF.helpers.tradeStates.funded || theEscrow.status === escrowF.helpers.tradeStates.paid))) ||
      (theEscrow.fundStatus === States.pending || (theEscrow.mining && theEscrow.status === escrowF.helpers.tradeStates.waiting)) ||
      theEscrow.payStatus === States.pending),
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
