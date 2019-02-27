import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Row, Col} from "reactstrap";

import Offer from '../../components/Offer';
import CancelEscrow from './components/CancelEscrow';
import CardEscrow from './components/CardEscrow';
import EscrowDetail from './components/EscrowDetail';
import OpenChat from './components/OpenChat';

class Escrow extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <div className="escrow">
        <CardEscrow/>
        <CancelEscrow/>
        <Row className="bg-secondary p-4 mt-4">
          <Col>
            <h2>You are trading with</h2>
            <Offer offer={{owner: 'avb', user: { username: 'Anthony', location: 'London'}, currency: 'USD', token: { symbol: 'SNT'}}}/>
            <EscrowDetail/>
            <OpenChat/>
          </Col>
        </Row>
      </div>
    );
  }
}

Escrow.propTypes = {
  history: PropTypes.object
};

const mapStateToProps = state => {
  return {
  };
};

export default connect(
  mapStateToProps,
  {
  }
)(withRouter(Escrow));
