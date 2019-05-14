import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Button, Col, Row} from "reactstrap";

import ContactUser from './components/ContactUser';
import TradeParticipant from './components/TradeParticipant';
import EscrowDetail from './components/EscrowDetail';
import ReadChatLogs from './components/ReadChatLogs';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';

import arbitration from '../../features/arbitration';
import network from '../../features/network';

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

  componentDidMount() {
  }

  render() {
    const {escrow, address} = this.props;

    if(!escrow){
      return <Loading/>;
    }

    if(escrow.buyer === address || escrow.seller === address) return <ErrorInformation message="You cannot arbitrate your own disputes"/>;
    
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
        <Row className="mt-4">
          <Col xs={3} />
          <Col xs={6}>
            <Button color="primary" block>Make Decision</Button>
          </Col>
          <Col xs={3} />
        </Row>
      </div>
    );
  }
}

Arbitration.propTypes = {
  history: PropTypes.object,
  address: PropTypes.string,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  loadArbitration: PropTypes.func
};


const mapStateToProps = (state, props) => {
  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: arbitration.selectors.getArbitration(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadArbitration: arbitration.actions.loadArbitration
  }
)(withRouter(Arbitration));
