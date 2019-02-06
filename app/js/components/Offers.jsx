import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faEuroSign } from "@fortawesome/free-solid-svg-icons";

class Offers extends Component {
  renderOffers(t) {
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
              <dt>{t('offers.type')}</dt>
              <dd>{offer.type}</dd>
            </dl>
            <dl className="col-6">
              <dt>{t('offers.paymentMethods')}</dt>
              <dd>{offer.paymentMethod}</dd>
            </dl>
          </Row>
          <Row>
            <dl className="col-6">
              <dt>{t('offers.location')}</dt>
              <dd>{offer.location}</dd>
            </dl>
            <dl className="col-6">
              <dt>{t('offers.rate')}</dt>
              <dd>{offer.rate}</dd>
            </dl>
          </Row>
        </CardBody>
      </Card>
    ));
  }

  renderEmpty(t) {
    return (
      <Card body className="text-center">
        {t('offers.noOpen')}
      </Card>
    );
  }

  render() {
    const t = this.props.t;
    return (
      <Row className="mt-4">
        <Col xs="12">
          <span className="font-weight-bold h5">{t('offers.title')}</span>
          <Link to="/sell" className="float-right">{t('offers.create')}</Link>
        </Col>
        <Col xs="12">
          {this.props.offers.length === 0 ? this.renderEmpty(t) : this.renderOffers(t)}
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
