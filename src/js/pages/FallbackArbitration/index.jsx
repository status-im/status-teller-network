import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Button, Col, Row, Input} from "reactstrap";
import {DialogOptions as ContactMethods} from '../../constants/contactMethods';
import { stringToContact, copyToClipboard } from '../../utils/strings';
import ContactUser from './components/ContactUser';
import TradeParticipant from './components/TradeParticipant';
import EscrowDetail from './components/EscrowDetail';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';
import arbitration from '../../features/arbitration';
import network from '../../features/network';
import metadata from '../../features/metadata';
import ModalDialog from "../../components/ModalDialog";
import bubbleTriangle from "../../../images/diamond.png";
import RoundedIcon from "../../ui/RoundedIcon";
import ProfileIcon from "../../../images/profileUser.svg";
import {addressCompare} from "../../utils/address";
import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER, ARBITRATION_UNSOLVED, UNRESPONSIVE, PAYMENT, OTHER} from "../../features/arbitration/constants";

import './index.scss';
import {Trans, withTranslation} from "react-i18next";

class Arbitration extends Component {
  constructor(props){
    super(props);
    props.loadArbitration(props.escrowId);
    this.getProfiles();
  }

  getProfiles() {
    if (this.props.escrow && !this.props.sellerInfo) {
      this.props.getProfile(this.props.escrow.seller);
    }
    if (this.props.escrow && !this.props.buyerInfo) {
      this.props.getProfile(this.props.escrow.buyer);
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.escrow && this.props.escrow) {
      this.getProfiles();
    }
  }

  state = {
    displayUsers: false,
    selectedUser: null,
    displayContactDialog: false
  };

  openSolveDisputeDialog = () => {
    this.setState({displayUsers: true});
  };

  selectUser = selectedUser => () => {
    this.setState({selectedUser});
  };

  handleClose = () => {
    this.setState({
      displayUsers: false,
      selectedUser: null
    });
  };

  getArbitrationStatus(status) {
    switch(status){
      case ARBITRATION_UNSOLVED:
        return this.props.t('arbitration.status.open');
      case ARBITRATION_SOLVED_BUYER:
      case ARBITRATION_SOLVED_SELLER:
        return this.props.t('arbitration.status.resolved');
      default:
        return this.props.t('arbitration.status.undetermined');
    }
  }

  getMotiveTxt(escrow, openedByBuyer) {
    switch (escrow.arbitration.motive) {
      case UNRESPONSIVE:
        return openedByBuyer ? this.props.t('arbitration.motive.unresponsiveSeller') : this.props.t('arbitration.motive.unresponsiveBuyer');
      case PAYMENT:
        if (openedByBuyer) return this.props.t('arbitration.motive.paymentSeller');
        return this.props.t('arbitration.motive.paymentBuyer');
      case OTHER:
        return this.props.t('arbitration.motive.other');
      default:
        return escrow.arbitration.motive;
    }
  }

  renderContactDialog() {
    const {t, isStatus, buyerInfo, sellerInfo} = this.props;
    const isBuyer = this.state.displayContactDialog === 'buyer';

    return (
      <ModalDialog display={!!this.state.displayContactDialog} onClose={this.displayContactDialog(false)} hideButton>
          <RoundedIcon image={ProfileIcon} bgColor="blue" className="mb-2" />

          {isBuyer && <Trans i18nKey="contactDialog.contactMethod" values={{username: buyerInfo.username, contactMethod: ContactMethods[stringToContact(buyerInfo.contactData).method]}}>
            {buyerInfo.username} <span className="text-muted">{ContactMethods[stringToContact(buyerInfo.contactData).method]}</span>
          </Trans>}

          {!isBuyer && <Trans i18nKey="contactDialog.contactMethod" values={{username: sellerInfo.username, contactMethod: ContactMethods[stringToContact(sellerInfo.contactData).method]}}>
            {buyerInfo.username} <span className="text-muted">{ContactMethods[stringToContact(sellerInfo.contactData).method]}</span>
          </Trans>}

          <Row noGutters className="mt-4">
            <Col xs={9}>
              <Input type="text"
                      value={stringToContact(isBuyer ? buyerInfo.contactData : sellerInfo.contactData).userId}
                      readOnly
                      className="form-control"
                      />
            </Col>
            <Col xs={3}>
              <Button className="px-3 float-right"
                      color="primary"
                      onClick={() => copyToClipboard(stringToContact(isBuyer ? buyerInfo.contactData : sellerInfo.contactData).userId)}>
                {t('escrow.page.copy')}
              </Button>
            </Col>
          </Row>
          {!isStatus && ((isBuyer && buyerInfo.contactData.startsWith("Status")) || (!isBuyer && sellerInfo.contactData.startsWith("Status"))) && <p className="text-center text-muted mt-3">
            <span>{t('escrow.page.notStatusUser')}</span> <a href="https://status.im/get/" target="_blank" rel="noopener noreferrer">{t('escrow.page.getStatusNow')}</a>
          </p>}
        </ModalDialog>
      );
  }

  displayContactDialog = show => (e) => {
    if(e) e.preventDefault();
    this.setState({displayContactDialog: show});
    return false;
  }

  render() {
    const {t, escrow, address, buyerInfo, sellerInfo, isStatus} = this.props;

    if (!escrow || !buyerInfo || !sellerInfo) {
      return <Loading/>;
    }

    if (addressCompare(escrow.buyer, address) || addressCompare(escrow.seller, address)) {
      return <ErrorInformation message={t('arbitration.ownDispute')}/>;
    }
    if (!addressCompare(escrow.arbitrator, address)) {
      return <ErrorInformation message={t('arbitration.notYours')}/>;
    }

    const status = this.getArbitrationStatus(escrow.arbitration.result);
    const openedByBuyer = addressCompare(escrow.arbitration.openBy, escrow.buyer);
    return (
      <div className="escrow">
        <h2>
          <Trans i18nKey="arbitration.disputeDetails" values={{status}}>
            Dispute Details <span className={"arbitrationStatus " + status}>{{status}}</span>
          </Trans>
        </h2>

        {escrow.arbitration.result.toString() !== ARBITRATION_UNSOLVED && <Fragment>
          <h3>{t('arbitration.disputeResolved')}</h3>
          <p>
            <span className="font-weight-bold">{t('arbitration.winner')}</span>&nbsp;
            {escrow.arbitration.result.toString() === ARBITRATION_SOLVED_BUYER ? t('general:buyer') : t('general:seller')}
          </p>
        </Fragment>}

        <p className="arbitrationMotive mt-3 mb-0">{this.getMotiveTxt(escrow, openedByBuyer)}</p>
        <span className="triangle"><img src={bubbleTriangle} alt="bubble-triangle"/></span>
        <TradeParticipant address={escrow.arbitration.openBy}
                          profile={openedByBuyer ? buyerInfo : sellerInfo} isBuyer={openedByBuyer}/>

        <EscrowDetail escrow={escrow}/>

        <h3 className="mt-4">{t('arbitration.participants')}</h3>
        <TradeParticipant address={escrow.buyer} profile={buyerInfo} isBuyer={true} multisigInfo
                          escrowId={escrow.escrowId}
                          winner={escrow.arbitration.result.toString() === ARBITRATION_SOLVED_BUYER}/>
        <TradeParticipant address={escrow.seller} profile={sellerInfo} isBuyer={false} multisigInfo
                          escrowId={escrow.escrowId}
                          winner={escrow.arbitration.result.toString() === ARBITRATION_SOLVED_SELLER}/>

        {this.renderContactDialog()}

        <ContactUser userInfo={buyerInfo} isBuyer={true} isStatus={isStatus} onClick={this.displayContactDialog('buyer')} />
        <ContactUser userInfo={sellerInfo} isBuyer={false} isStatus={isStatus} onClick={this.displayContactDialog('seller')} />
      </div>
    );
  }
}

Arbitration.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  sellerInfo: PropTypes.object,
  buyerInfo: PropTypes.object,
  address: PropTypes.string,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  loadArbitration: PropTypes.func,
  getProfile: PropTypes.func,
  isStatus: PropTypes.bool
};


const mapStateToProps = (state, props) => {
  const escrow = arbitration.selectors.getArbitration(state);
  return {
    isStatus: network.selectors.isStatus(state),
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: escrow,
    sellerInfo: escrow ? metadata.selectors.getProfile(state, escrow.seller) : null,
    buyerInfo: escrow ? metadata.selectors.getProfile(state, escrow.buyer) : null
  };
};

export default connect(
  mapStateToProps,
  {
    loadArbitration: arbitration.actions.loadArbitration,
    getProfile: metadata.actions.loadUserOnly
  }
)(withRouter(withTranslation()(Arbitration)));
