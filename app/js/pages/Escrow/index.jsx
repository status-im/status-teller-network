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

import escrow from '../../features/escrow';
import network from '../../features/network';

class Escrow extends Component {
  constructor(props){
    super(props);
    props.getEscrow(props.escrowId);
  }

  componentDidMount() {
  }

  render() {
    const {escrow, address} = this.props;

    if(!escrow){
      return <Loading/>;
    }


    const isBuyer = escrow.buyer === address;
    
    return (
      <div className="escrow">
        { isBuyer ? <CardEscrowBuyer /> : <CardEscrowSeller /> }
        <EscrowDetail/>
        <Row className="bg-secondary py-4 mt-4">
          <Col>
            <h3 className="mb-3">You are trading with</h3>
            <Offer offer={{owner: '0x12345678901234567890', user: { username: 'Anthony', location: 'London'}, currency: 'USD', token: { symbol: 'SNT'}}}/>
          </Col>
        </Row>
        <OpenChat/>
        <CancelEscrow/>
        <OpenDispute/>
      </div>
    );
  }
}

Escrow.propTypes = {
  history: PropTypes.object,
  address: PropTypes.string,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  getEscrow: PropTypes.func
};


const mapStateToProps = (state, props) => {
  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: escrow.selectors.getEscrow(state)
  };
};

export default connect(
  mapStateToProps,
  {
    getEscrow: escrow.actions.getEscrow
  }
)(withRouter(Escrow));
