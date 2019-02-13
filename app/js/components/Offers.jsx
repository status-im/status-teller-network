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
          {offer.asset}
          <FontAwesomeIcon icon={faArrowRight} className="mx-4"/>
          <FontAwesomeIcon icon={faEuroSign} className="mr-1"/>
          {offer.currency}
        </CardHeader>
        <CardBody>
          <Row>
            <dl className="col-6">
              <dt>{t('offers.type')}</dt>
              <dd></dd>
            </dl>
            <dl className="col-6">
              <dt>{t('offers.paymentMethods')}</dt>
              <dd>{offer.paymentMethods}</dd>
            </dl>
          </Row>
          <Row>
            <dl className="col-6">
              <dt>{t('offers.location')}</dt>
              <dd>{this.props.location}</dd>
            </dl>
            <dl className="col-6">
              <dt>{t('offers.rate')}</dt>
              <dd>{offer.margin} - {offer.marketType}</dd>
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
  location: PropTypes.string,
  offers: PropTypes.array
};

export default withNamespaces()(Offers);
