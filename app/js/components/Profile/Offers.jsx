import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Card, CardHeader, CardBody } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faEuroSign } from "@fortawesome/free-solid-svg-icons";

class Offers extends Component {
  renderOffers() {
    const {t, offers} = this.props;
    return offers.map((offer, index) => (
      <Card key={index} className="mb-2 shadow-sm">
        <CardHeader>
          {offer.token.symbol}
          <FontAwesomeIcon icon={faArrowRight} className="mx-4"/>
          <FontAwesomeIcon icon={faEuroSign} className="mr-1"/>
          {offer.currency}
        </CardHeader>
        <CardBody>
          <Row>
            <dl className="col-6">
              <dt>{t('offers.type')}</dt>
              <dd>{t('offers.typeSell')}</dd>
            </dl>
            <dl className="col-6">
              <dt>{t('offers.paymentMethods')}</dt>
              <dd>{offer.paymentMethodsForHuman}</dd>
            </dl>
          </Row>
          <Row>
            <dl className="col-6">
              <dt>{t('offers.location')}</dt>
              <dd>{this.props.location}</dd>
            </dl>
            <dl className="col-6">
              <dt>{t('offers.rate')}</dt>
              <dd>{offer.rateForHuman}</dd>
            </dl>
          </Row>
        </CardBody>
      </Card>
    ));
  }

  renderEmpty() {
    const {t} = this.props;
    return (
      <Card body className="text-center">
        {t('offers.noOpen')}
      </Card>
    );
  }

  render() {
    const {t, offers} = this.props;
    return (
      <div className="mt-3">
        <div>
          <h3 className="d-inline-block">{t('offers.title')}</h3>
          <span className="float-right">
            <Link to="/sell" className="float-right">{t('offers.create')} <FontAwesomeIcon icon={faArrowRight}/></Link>
          </span>
        </div>
        {offers.length === 0 ? this.renderEmpty() : this.renderOffers()}
      </div>
    );
  }
}

Offers.propTypes = {
  t: PropTypes.func,
  location: PropTypes.string,
  offers: PropTypes.array
};

export default withNamespaces()(Offers);
