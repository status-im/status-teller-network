import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faEuroSign } from "@fortawesome/free-solid-svg-icons";

class Offers extends Component {
  renderOffers() {
    return this.props.offers.map((offer, index) => (
      <Card key={index} className="mb-2">
        <CardHeader>
          {offer.from}
          <FontAwesomeIcon icon={faArrowRight} className="mx-4"/>
          <FontAwesomeIcon icon={faEuroSign} className="mr-1"/>
          {offer.to}
        </CardHeader>
        <CardBody>
          <Row>
            <dl className="col-6">
              <dt>Type</dt>
              <dd>{offer.type}</dd>
            </dl>
            <dl className="col-6">
              <dt>Payment method</dt>
              <dd>{offer.paymentMethod}</dd>
            </dl>
          </Row>
          <Row>
            <dl className="col-6">
              <dt>Location</dt>
              <dd>{offer.location}</dd>
            </dl>
            <dl className="col-6">
              <dt>Rate</dt>
              <dd>{offer.rate}</dd>
            </dl>
          </Row>
        </CardBody>
      </Card>
    ));
  }

  renderEmpty() {
    return (
      <Card body className="text-center">
        No open offers
      </Card>
    );
  }

  render() {
    const t = this.props.t;
    return (
      <Row className="mt-4">
        <Col xs="12">
          <span className="font-weight-bold h5">My offers</span>
          <Link to="/sell" className="float-right">Create offer</Link>
        </Col>
        <Col xs="12">
          {this.props.offers.length === 0 ? this.renderEmpty() : this.renderOffers()}
        </Col>
      </Row>
    );
  }
}

Offers.propTypes = {
  t: PropTypes.func,
  offers: PropTypes.array
};

export default withNamespaces()(Offers);
