import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';

class Offers extends Component {
  render() {
    const t = this.props.t;
    return (
      <Row className="mt-4">
        <Col xs="12">
          <span className="font-weight-bold h5">My offers</span>
          <Link to="create-offer" className="float-right">Create offer</Link>
        </Col>
        <Col xs="12">
          <Card body className="text-center">
            No open offers
          </Card>
        </Col>
      </Row>
    );
  }
}

Offers.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(Offers);
