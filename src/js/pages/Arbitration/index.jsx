import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Button, Col, Row, Modal, ModalBody, ButtonGroup, ModalFooter} from "reactstrap";

import ContactUser from './components/ContactUser';
import TradeParticipant from './components/TradeParticipant';
import EscrowDetail from './components/EscrowDetail';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';

import arbitration from '../../features/arbitration';
import network from '../../features/network';
import metadata from '../../features/metadata';

import CheckButton from '../../ui/CheckButton';
import Identicon from "../../components/UserInformation/Identicon";
import ConfirmDialog from "../../components/ConfirmDialog";
import bubbleTriangle from "../../../images/diamond.png";

import {addressCompare} from "../../utils/address";

import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER, ARBITRATION_UNSOLVED, UNRESPONSIVE, PAYMENT, OTHER} from "../../features/arbitration/constants";

import './index.scss';
import classnames from "classnames";

const getArbitrationStatus = status => {
  switch(status){
    case ARBITRATION_UNSOLVED:
      return "open";
    case ARBITRATION_SOLVED_BUYER:
    case ARBITRATION_SOLVED_SELLER:
      return "resolved";
    default:
      return "undetermined";
  }
};

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
    displayDialog: false
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
      selectedUser: null,
      displayDialog: false
    });
  };

  displayDialog = show => (e) => {
    if(e) e.preventDefault();

    this.setState({displayDialog: show});
    return false;
  };

  resolveDispute = () => {
    this.setState({displayDialog: false, displayUsers: false});

    this.props.resolveDispute(this.props.escrow.escrowId, addressCompare(this.state.selectedUser, this.props.escrow.buyer) ? ARBITRATION_SOLVED_BUYER : ARBITRATION_SOLVED_SELLER);
  };

  renderAccountInfo(address, userInfo, isBuyer) {
    return (<Fragment>
      <span className="text-center float-left mr-3">
                      <Identicon seed={address} className="rounded-circle border" scale={5}/>
                      <span className={classnames("icon-badge", {'seller-text': !isBuyer, 'buyer-text': isBuyer})}>{isBuyer ? 'Buyer' : 'Seller'}</span>
                    </span>
      <span className="d-inline-block pt-2">{userInfo.username}</span>
    </Fragment>);
  }

  renderModal() {
    const {escrow, buyerInfo, sellerInfo} = this.props;
    const {displayUsers, selectedUser} = this.state;

    return (<Modal isOpen={displayUsers} toggle={this.handleClose} backdrop={true} className="arbitrationDialog">
      <ModalBody>
        <h2 className="text-center">Your decision</h2>
        <p className="text-center">{escrow.tokenAmount} {escrow.token.symbol} goes to:</p>
        <ButtonGroup vertical className="w-100">
          <CheckButton active={addressCompare(selectedUser, escrow.buyer)} size="l"
                       onClick={this.selectUser(escrow.buyer)}>
            {this.renderAccountInfo(escrow.buyer, buyerInfo, true)}
          </CheckButton>
          <CheckButton active={addressCompare(selectedUser, escrow.seller)} size="l"
                       onClick={this.selectUser(escrow.seller)}>
            {this.renderAccountInfo(escrow.seller, sellerInfo, false)}
          </CheckButton>
        </ButtonGroup>
        <p className="text-center">
          <Button color="primary" onClick={this.displayDialog(true)} disabled={selectedUser === null}>Resolve
            dispute</Button>
        </p>
      </ModalBody>
      <ModalFooter>
        <Button onClick={this.handleClose}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }

  render() {
    const {escrow, address, loading, buyerInfo, sellerInfo} = this.props;

    if(!escrow || !buyerInfo || !sellerInfo){
      return <Loading/>;
    }

    if(addressCompare(escrow.buyer, address) || addressCompare(escrow.seller, address)) return <ErrorInformation message="You cannot arbitrate your own disputes"/>;
    if(!addressCompare(escrow.arbitrator, address)) return <ErrorInformation message="You are not the arbitrator of this dispute"/>;

    if(loading) return <Loading mining={true} />;

    const status = getArbitrationStatus(escrow.arbitration.result);
    const openedByBuyer = addressCompare(escrow.arbitration.openBy, escrow.buyer);
    return (
      <div className="escrow">
        <h2>Dispute Details <span className={"arbitrationStatus " + status}>{status}</span></h2>

        {escrow.arbitration.result.toString() !== ARBITRATION_UNSOLVED && <Fragment>
          <h3>Dispute resolved</h3>
          <p><span className="font-weight-bold">Winner:</span> {escrow.arbitration.result.toString() === ARBITRATION_SOLVED_BUYER ? 'Buyer' : 'Seller'}</p>
        </Fragment>}

        <p className="arbitrationMotive mt-3 mb-0">{getMotiveTxt(escrow, openedByBuyer)}</p>
        <span className="triangle"><img src={bubbleTriangle} alt="buble-triangle"/></span>
        <TradeParticipant address={escrow.arbitration.openBy}
                          profile={openedByBuyer ? buyerInfo : sellerInfo} isBuyer={openedByBuyer}/>

        <EscrowDetail escrow={escrow}/>

        <h3 className="mt-4">Trade participants</h3>
        <TradeParticipant address={escrow.buyer} profile={buyerInfo} isBuyer={true} winner={escrow.arbitration.result.toString() === ARBITRATION_SOLVED_BUYER}/>
        <TradeParticipant address={escrow.seller} profile={sellerInfo} isBuyer={false} winner={escrow.arbitration.result.toString() === ARBITRATION_SOLVED_SELLER}/>

        <ContactUser username={buyerInfo.username} seed={escrow.buyer} statusContactCode={buyerInfo.statusContactCode} isBuyer={true}/>
        <ContactUser username={sellerInfo.username} seed={escrow.seller} statusContactCode={sellerInfo.statusContactCode} isBuyer={false}/>

        {(escrow.arbitration.open || escrow.arbitration.result.toString() === "0") && (
          <Fragment>
            <Row className="mt-4">
              <Col xs={3} />
              <Col xs={6}>
                <Button color="primary" block onClick={this.openSolveDisputeDialog}>Make Decision</Button>
              </Col>
              <Col xs={3} />
            </Row>

            {this.renderModal()}

            <ConfirmDialog display={this.state.displayDialog} onConfirm={this.resolveDispute} onCancel={this.displayDialog(false)} title="Resolve dispute" content="Are you sure?" cancelText="No" />
          </Fragment>
        )}
      </div>
    );
  }
}

Arbitration.propTypes = {
  history: PropTypes.object,
  sellerInfo: PropTypes.object,
  buyerInfo: PropTypes.object,
  address: PropTypes.string,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  loadArbitration: PropTypes.func,
  getProfile: PropTypes.func,
  resolveDispute: PropTypes.func,
  loading: PropTypes.bool
};


const mapStateToProps = (state, props) => {
  const escrow = arbitration.selectors.getArbitration(state);
  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: escrow,
    sellerInfo: escrow ? metadata.selectors.getProfile(state, escrow.seller) : null,
    buyerInfo: escrow ? metadata.selectors.getProfile(state, escrow.buyer) : null,
    loading: arbitration.selectors.isLoading(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadArbitration: arbitration.actions.loadArbitration,
    resolveDispute: arbitration.actions.resolveDispute,
    getProfile: metadata.actions.loadUserOnly
  }
)(withRouter(Arbitration));


function getMotiveTxt(escrow, openedByBuyer) {
  switch (escrow.arbitration.motive) {
    case UNRESPONSIVE:
      return `${openedByBuyer ? "Seller" : "Buyer"} is unresponsive/inactive after transaction is marked as paid`;
    case PAYMENT:
      if (openedByBuyer) return 'Seller states something is wrong with payment and refuses to release';
      return 'Buyer made attempt to pay but there are issues with the payment';
    case OTHER:
      return 'Other reasons';
    default:
      return escrow.arbitration.motive;
  }
}

