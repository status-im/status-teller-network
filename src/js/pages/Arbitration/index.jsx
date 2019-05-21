import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Button, Col, Row, Modal, ModalBody, ButtonGroup, ModalFooter} from "reactstrap";

import ContactUser from './components/ContactUser';
import TradeParticipant from './components/TradeParticipant';
import EscrowDetail from './components/EscrowDetail';
import ReadChatLogs from './components/ReadChatLogs';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';

import arbitration from '../../features/arbitration';
import network from '../../features/network';

import CheckButton from '../../ui/CheckButton';
import Identicon from "../../components/UserInformation/Identicon";
import ConfirmDialog from "../../components/ConfirmDialog";

import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER, ARBITRATION_UNSOLVED} from "../../features/arbitration/constants";

import './index.scss';

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
  }

  state = {
    displayUsers: false,
    selectedUser: null,
    displayDialog: false
  }

  openSolveDisputeDialog = () => {
    this.setState({displayUsers: true});
  }

  selectUser = selectedUser => () => {
    this.setState({selectedUser});
  }

  handleClose = () => {
    this.setState({
      displayUsers: false,
      selectedUser: null,
      displayDialog: false
    });
  }

  displayDialog = show => (e) => {
    if(e) e.preventDefault();

    this.setState({displayDialog: show});
    return false;
  };

  resolveDispute = () => {
    this.setState({displayDialog: false, displayUsers: false});

    this.props.resolveDispute(this.props.escrow.escrowId, this.state.selectedUser === this.props.escrow.buyer ? ARBITRATION_SOLVED_BUYER : ARBITRATION_SOLVED_SELLER);
  }

  render() {
    const {escrow, address, loading} = this.props;
    const {displayUsers, selectedUser} = this.state;

    if(!escrow){
      return <Loading/>;
    }

    if(escrow.buyer === address || escrow.seller === address) return <ErrorInformation message="You cannot arbitrate your own disputes"/>;
    if(escrow.arbitrator !== address) return <ErrorInformation message="You are not the arbitrator of this dispute"/>;
    
    if(loading) return <Loading mining={true} />;

    const status = getArbitrationStatus(escrow.arbitration.result);
    return (
      <div className="escrow">
        <h2>Dispute Details <span className={"arbitrationStatus " + status}>{status}</span></h2>
        <div className="arbitrationMotive">
          TODO: Add arbitration motive here
        </div>
        <span className="triangle" />
        <TradeParticipant address={escrow.arbitration.openBy} info={escrow.arbitration.openBy === escrow.buyer ? escrow.buyerInfo : escrow.sellerInfo} />
        <EscrowDetail escrow={escrow} />
        <h5 className="mt-4">Trade participants</h5>
        <TradeParticipant address={escrow.buyer} info={escrow.buyerInfo} />
        <TradeParticipant address={escrow.seller} info={escrow.sellerInfo} />
        <ReadChatLogs/>
        <ContactUser username={escrow.buyerInfo.username} seed={escrow.buyer} statusContactCode={escrow.buyerInfo.statusContactCode} />
        <ContactUser username={escrow.sellerInfo.username} seed={escrow.seller} statusContactCode={escrow.sellerInfo.statusContactCode}  />
        {(escrow.arbitration.open || escrow.arbitration.result.toString() === "0") && (
          <Fragment>
            <Row className="mt-4">
              <Col xs={3} />
              <Col xs={6}>
                <Button color="primary" block onClick={this.openSolveDisputeDialog}>Make Decision</Button>
              </Col>
              <Col xs={3} />
            </Row>
            <Modal isOpen={displayUsers} toggle={this.handleClose} backdrop={true} className="arbitrationDialog" >
              <ModalBody>
                <h2 className="text-center">Your decision</h2>
                <p className="text-center">{escrow.tokenAmount} {escrow.token.symbol} goes to:</p>
                <ButtonGroup vertical className="w-100">
                  <CheckButton active={selectedUser === escrow.buyer} size="l" onClick={this.selectUser(escrow.buyer)}>
                    <Identicon seed={escrow.buyerInfo.statusContactCode} className="rounded-circle border mr-2" scale={5}/>
                    {escrow.buyerInfo.username}
                  </CheckButton>
                  <CheckButton active={selectedUser === escrow.seller} size="l" onClick={this.selectUser(escrow.seller)}>
                    <Identicon seed={escrow.sellerInfo.statusContactCode} className="rounded-circle border mr-2" scale={5}/>
                    {escrow.sellerInfo.username}
                  </CheckButton>
                </ButtonGroup>
                <p className="text-center">
                  <Button color="primary" onClick={this.displayDialog(true)} disabled={selectedUser === null}>Resolve dispute</Button>
                </p>
              </ModalBody>
              <ModalFooter>
                <Button onClick={this.handleClose}>Cancel</Button>
              </ModalFooter>
            </Modal>
            <ConfirmDialog display={this.state.displayDialog} onConfirm={this.resolveDispute} onCancel={this.displayDialog(false)} title="Resolve dispute" content="Are you sure?" cancelText="No" />
          </Fragment>
        )}
      </div>
    );
  }
}

Arbitration.propTypes = {
  history: PropTypes.object,
  address: PropTypes.string,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  loadArbitration: PropTypes.func,
  resolveDispute: PropTypes.func,
  loading: PropTypes.bool
};


const mapStateToProps = (state, props) => {
  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: arbitration.selectors.getArbitration(state),
    loading: arbitration.selectors.isLoading(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadArbitration: arbitration.actions.loadArbitration,
    resolveDispute: arbitration.actions.resolveDispute
  }
)(withRouter(Arbitration));
