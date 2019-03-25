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

import arbitration from '../../features/arbitration';
import network from '../../features/network';

import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER, ARBITRATION_UNSOLVED} from "../../features/arbitration/constants";
const getArbitrationStatus = status => {
  switch(status){
    case ARBITRATION_UNSOLVED: 
      return "open";
    case ARBITRATION_SOLVED_BUYER: 
    case ARBITRATION_SOLVED_SELLER:
      return "open";
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
    console.log(this.props);
    const {escrow} = this.props;

    if(!escrow){
      return <Loading/>;
    }
    
    const status = getArbitrationStatus(escrow.arbitration.result);
    
    return (
      <div className="escrow">
        <h2>Dispute Details <span>{status}</span></h2>
        <h4>TODO: Add arbitration motive here</h4>
        <TradeParticipant address={escrow.arbitration.openBy} info={escrow.arbitration.openBy == escrow.buyer ? escrow.buyerInfo : escrow.sellerInfo} />
        <EscrowDetail escrow={escrow} />
        <h5 className="mt-4">Trade participants</h5>
        <TradeParticipant address={escrow.buyer} info={escrow.buyerInfo} />
        <TradeParticipant address={escrow.seller} info={escrow.sellerInfo} />
        <ReadChatLogs/>
        <ContactUser username={escrow.buyerInfo.username} seed={escrow.buyer}/>
        <ContactUser username={escrow.sellerInfo.username} seed={escrow.seller}/>
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
