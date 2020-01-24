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
import Profile from './components/Profile';
import OpenDispute from './components/OpenDispute';
import Loading from '../../components/Loading';
import ApproveTokenFunds from './components/ApproveTokenFunds';
import { ARBITRATION_UNSOLVED } from '../../features/arbitration/constants';
import ErrorInformation from "../../components/ErrorInformation";
import {Col, Row, Input, Button} from 'reactstrap';
import RoundedIcon from "../../ui/RoundedIcon";
import exclamationCircle from "../../../images/exclamation-circle.png";
import {ReactComponent as checkCircle} from '../../../images/check-circle.svg';
import canceledIcon from "../../../images/cancel.svg";
import bellIcon from "../../../images/bell.svg";
import closeIcon from "../../../images/close_profile.svg";
import ModalDialog from '../../components/ModalDialog';
import {zeroAddress, addressCompare} from '../../utils/address';
import {States, checkNotEnoughETH} from '../../utils/transaction';
import {toTokenDecimals, fromTokenDecimals} from '../../utils/numbers';
import ProfileIcon from "../../../images/profileUser.svg";
import escrowF from '../../features/escrow';
import network from '../../features/network';
import metadata from '../../features/metadata';
import approval from '../../features/approval';
import arbitrationF from '../../features/arbitration';
import events from '../../features/events';
import prices from '../../features/prices';
import emailNotifications from "../../features/emailNotifications";
import {DialogOptions as ContactMethods} from '../../constants/contactMethods';
import { stringToContact, copyToClipboard } from '../../utils/strings';
import {withTranslation, Trans} from "react-i18next";
import ConnectWallet from '../../components/ConnectWallet';

import "./index.scss";
import ApproveTokenRow from "./components/ApproveTokenRow";

const {toBN} = web3.utils;

class Escrow extends Component {
  constructor(props) {
    super(props);
    this.loadData();
    this.props.checkEmailSubscription();
  }

  state = {
    showApproveFundsScreen: false,
    releaseAnyway: false,
    hideNotifBox: false,
    displayDialog: false
  };

  displayDialog = show => (e) => {
    if(e) e.preventDefault();
    this.setState({displayDialog: show});
    return false;
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

  componentDidMount() {
    if (this.props.isEip1102Enabled) {
      this.loadData();
    }
  }

  showApproveScreen = () => {
    this.setState({showApproveFundsScreen: true});
  };

  componentDidUpdate(prevProps) {
    if ((!prevProps.isEip1102Enabled && this.props.isEip1102Enabled) || (!prevProps.address && this.props.address)) {
      this.loadData();
    }

    if ((prevProps.loading && !this.props.loading) || (prevProps.escrow === null && this.props.escrow !== null) || (!prevProps.address && this.props.address)) { // Reload allowance information
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

  goToEmailPage = (e) => {
    if (e.target.alt === 'close') {
      return;
    }
    this.props.setRedirectTarget(this.props.location.pathname);
    this.props.history.push('/email-subscribe');
  };

  render() {
    let {t, escrowId, escrow, arbitration, address, sntAllowance, tokenAllowance, loading, tokens, fundEscrow,
      cancelEscrow, releaseEscrow, payEscrow, rateTransaction, approvalTxHash, lastActivity, isStatus,
      approvalError, cancelDispute, ethBalance, gasPrice, feeMilliPercent, arbitrationTxHash, isEip1102Enabled, enableEthereum } = this.props;

      if (!isEip1102Enabled || !address) {
        return <ConnectWallet enableEthereum={enableEthereum} />;
      }

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
    const userInfo = this.getUserInfo(escrow);
    const isBuyer = addressCompare(escrow.buyer, address);
    const offer = this.getOffer(escrow, isBuyer);
    offer.token = token;

    const requiredBalance = this.calculateRequiredBalance();
    const isTokenApproved = (tokenAllowance !== null && toBN(tokenAllowance).gte(toBN(requiredBalance)));
    const shouldResetToken = token.address !== zeroAddress && tokenAllowance !== null && toBN(tokenAllowance).gt(toBN(0)) && toBN(requiredBalance).gt(toBN(tokenAllowance));

    let showFundButton = isTokenApproved;
    if(isETH){
      showFundButton = true;
    }

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

    const escrowFiatAmount = (escrow.fiatAmount / 100).toFixed(2);

    const enoughBalance = toBN(escrow.token.balance ? toTokenDecimals(escrow.token.balance || 0, escrow.token.decimals) : 0).gte(totalAmount);

    return (<Fragment>
      {!this.props.isSubscribed && !this.state.hideNotifBox && !this.props.refusedEmailNotifications &&
      <div className="rounded shadow p-3 position-relative clickable" onClick={this.goToEmailPage}>
        <img alt="close" src={closeIcon} className="close-email-notification-box clickable" width={25} height={25}
             onClick={() => this.setState({hideNotifBox: true})}/>
        <RoundedIcon image={bellIcon} bgColor="blue" className="float-left mr-3"/>
        <p className="font-weight-medium mb-0">{t('escrow.page.emailNotif')}</p>
        <p className="text-muted mb-0 text-small">{t('escrow.page.getNotifs')}</p>
      </div>}

      <div className="escrow-warnings-and-infos">
        {arbitrationDetails.open && <Row className="mt-4">
          <Col xs="2">
            <RoundedIcon image={exclamationCircle} bgColor="red"/>
          </Col>
          <Col xs="10 my-auto text-danger">
            <p className="m-0">{t('escrow.page.tradeInDispute')}</p>
          </Col>
        </Row>}

        {((!isBuyer && arbitrationDetails.result === arbitrationF.constants.ARBITRATION_SOLVED_BUYER) ||
          (isBuyer && arbitrationDetails.result === arbitrationF.constants.ARBITRATION_SOLVED_SELLER)) &&
        <Row className="mt-4">
          <Col xs="2">
            <RoundedIcon image={exclamationCircle} bgColor="red"/>
          </Col>
          <Col xs="10 my-auto text-danger">
            <p className="m-0">{t('escrow.page.arbiRuledAgainst')}</p>
          </Col>
        </Row>}

        {((isBuyer && arbitrationDetails.result === arbitrationF.constants.ARBITRATION_SOLVED_BUYER) ||
          (!isBuyer && arbitrationDetails.result === arbitrationF.constants.ARBITRATION_SOLVED_SELLER)) &&
        <Row className="mt-4">
          <Col xs="2">
            <RoundedIcon imageComponent={checkCircle} className="disputeSuccess" size="sm" bgColor="green"/>
          </Col>
          <Col xs="10 my-auto text-success">
            <p className="m-0">{t('escrow.page.arbiRuledFor')}</p>
          </Col>
        </Row>}

        {escrow.status === escrowF.helpers.tradeStates.canceled && arbitrationDetails.result !== arbitrationF.constants.ARBITRATION_SOLVED_SELLER  && <Row className="mt-4">
          <Col xs="2">
            <RoundedIcon image={canceledIcon} bgColor="red"/>
          </Col>
          <Col xs="10 my-auto text-danger">
            <p className="m-0">{t('escrow.page.tradeWasCanceled')}</p>
          </Col>
        </Row>}
      </div>

      <div className={classnames("escrow", {'escrow-disabled': arbitrationDetails.open})}>
        {!isETH && !isBuyer &&
        <ApproveTokenRow
          isActive={!showFundButton && escrow.fundStatus !== States.success && escrow.status === escrowF.helpers.tradeStates.waiting}
          disabled={arbitrationDetails.open}
          isDone={showFundButton || escrow.fundStatus === States.success || escrow.status === escrowF.helpers.tradeStates.funded ||
          escrow.status === escrowF.helpers.tradeStates.paid || escrow.status === escrowF.helpers.tradeStates.released}
          enoughBalance={enoughBalance}
          tokenAmount={escrow.tokenAmount.toString()}
          tokenSymbol={escrow.token.symbol}
          action={this.showApproveScreen}/>}

        <FundingEscrow
          isActive={showFundButton && escrow.fundStatus !== States.success && escrow.status === escrowF.helpers.tradeStates.waiting}
          isBuyer={isBuyer}
          disabled={arbitrationDetails.open}
          isDone={escrow.fundStatus === States.success || escrow.status === escrowF.helpers.tradeStates.funded ||
          escrow.status === escrowF.helpers.tradeStates.paid || escrow.status === escrowF.helpers.tradeStates.released}
          needsApproval={!showFundButton}
          enoughBalance={enoughBalance}
          feePercent={feePercent.toString()}
          feeAmount={fromTokenDecimals(feeAmount, escrow.token.decimals).toString()}
          tokenAmount={escrow.tokenAmount.toString()}
          tokenSymbol={escrow.token.symbol}
          action={() => fundEscrow(escrow)}/>

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
              rateTransaction={rateTransaction} trade={escrow} isBuyer={isBuyer}
              rateBuyerStatus={escrow.rateBuyerStatus}
              rateSellerStatus={escrow.rateSellerStatus}
              hadDispute={ arbitrationDetails.result !== arbitrationF.constants.ARBITRATION_UNSOLVED}
              />
      </div>

      <EscrowDetail escrow={escrow}
                    arbitrationDetails={arbitrationDetails}
                    isBuyer={isBuyer}
                    onClickChat={this.displayDialog}
                    isStatus={isStatus}
                    currentPrice={this.props.assetCurrentPrice} />

      <ModalDialog display={!!this.state.displayDialog} onClose={this.displayDialog(false)} hideButton>
        <RoundedIcon image={ProfileIcon} bgColor="blue" className="mb-2" />

        <Trans i18nKey="contactDialog.contactMethod" values={{username: userInfo.username, contactMethod: ContactMethods[stringToContact(userInfo.contactData).method]}}>
          {userInfo.username}&apos;s <span className="text-muted">{ContactMethods[stringToContact(userInfo.contactData).method]}</span>
        </Trans>

        <Row noGutters className="mt-4">
          <Col xs={9}>
            <Input type="text"
                    value={stringToContact(userInfo.contactData).userId}
                    readOnly
                    className="form-control"
                    />
          </Col>
          <Col xs={3}>
            <Button className="px-3 float-right"
                    color="primary"
                    onClick={() => copyToClipboard(stringToContact(userInfo.contactData).userId)}>
              {t('escrow.page.copy')}
            </Button>
          </Col>
        </Row>
        {!isStatus && userInfo && userInfo.contactData.startsWith("Status") && <p className="text-center text-muted mt-3">
          <span>{t('escrow.page.notStatusUser')}</span> <a href="https://status.im/get/" target="_blank" rel="noopener noreferrer">{t('escrow.page.getStatusNow')}</a>
        </p>}
      </ModalDialog>
      <Profile withBuyer={!isBuyer} address={isBuyer ? escrow.offer.owner : escrow.buyer}/>
      <CancelEscrow trade={escrow} cancelEscrow={cancelEscrow} isBuyer={isBuyer} notEnoughETH={notEnoughETH}
                    canRelay={canRelay} lastActivity={lastActivity} isETHorSNT={isETHorSNT}/>
      {(arbitrationDetails && arbitrationDetails.open && addressCompare(arbitrationDetails.openBy, address) && arbitrationDetails.result === ARBITRATION_UNSOLVED) &&
      <CancelDispute trade={escrow} cancelDispute={cancelDispute}/>}
      {(!arbitrationDetails || !arbitrationDetails.open) && <OpenDispute trade={escrow}/>}
    </Fragment>);
  }

  getUserInfo(escrow) {
    switch(this.state.displayDialog){
      case 'buyer': return escrow.buyerInfo;
      case 'seller': return escrow.seller;
      default: return escrow.arbitratorInfo;
    }
  }
}

Escrow.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
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
  feeMilliPercent: PropTypes.string,
  isSubscribed: PropTypes.bool,
  refusedEmailNotifications: PropTypes.bool,
  checkEmailSubscription: PropTypes.func,
  setRedirectTarget: PropTypes.func,
  isStatus: PropTypes.bool,
  isEip1102Enabled: PropTypes.bool,
  enableEthereum: PropTypes.func
};

const mapStateToProps = (state, props) => {
  const approvalLoading = approval.selectors.isLoading(state);
  const arbitrationLoading = arbitrationF.selectors.isLoading(state);
  const escrowId = props.match.params.id.toString();
  const theEscrow = escrowF.selectors.getEscrowById(state, escrowId);
  const address =  network.selectors.getAddress(state) || "";
  return {
    address,
    isStatus: network.selectors.isStatus(state),
    escrowId:  escrowId,
    escrow: theEscrow,
    arbitration: arbitrationF.selectors.getArbitration(state) || {},
    arbitrationTxHash: arbitrationF.selectors.txHash(state),
    sntAllowance: approval.selectors.getSNTAllowance(state),
    tokenAllowance: approval.selectors.getTokenAllowance(state),
    approvalTxHash: approval.selectors.txHash(state),
    approvalError: approval.selectors.error(state),
    refusedEmailNotifications: emailNotifications.selectors.refusedEmailNotifications(state),
    tokens: network.selectors.getTokens(state),
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state),
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
    ethBalance: network.selectors.getBalance(state, 'ETH'),
    isSubscribed: emailNotifications.selectors.isSubscribed(state)
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
    loadArbitration: arbitrationF.actions.loadArbitration,
    cancelDispute: arbitrationF.actions.cancelDispute,
    watchEscrow: escrowF.actions.watchEscrow,
    getLastActivity: escrowF.actions.getLastActivity,
    checkEmailSubscription: emailNotifications.actions.checkEmailSubscription,
    setRedirectTarget: emailNotifications.actions.setRedirectTarget,
    enableEthereum: metadata.actions.enableEthereum
  }
)(withRouter(withTranslation()(Escrow)));
