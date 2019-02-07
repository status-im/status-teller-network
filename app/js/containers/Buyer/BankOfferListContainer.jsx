import React, {Component, Fragment} from 'react';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';
import OfferListing from "../../components/OfferListing";
import {Col, Row} from "reactstrap";
import SorterFilter from '../../components/Buyer/SorterFilter';
import LogoCircle from '../../components/Buyer/LogoCircle';

import './Listing.scss';

const DISTANT_DATA = [
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'George', location: 'Berlin, Deutschland', nbTrades: 54, isPositiveRating: false},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Allison', location: 'Rio de Janeiro', nbTrades: 2, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Roger', location: 'Paris, France', nbTrades: 76, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Roger', location: 'Paris, France', nbTrades: 76, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'George', location: 'Berlin, Deutschland', nbTrades: 54, isPositiveRating: false},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Allison', location: 'Rio de Janeiro', nbTrades: 2, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Roger', location: 'Paris, France', nbTrades: 76, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Roger', location: 'Paris, France', nbTrades: 76, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'George', location: 'Berlin, Deutschland', nbTrades: 54, isPositiveRating: false},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Allison', location: 'Rio de Janeiro', nbTrades: 2, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Roger', location: 'Paris, France', nbTrades: 76, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Roger', location: 'Paris, France', nbTrades: 76, isPositiveRating: true},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Roger', location: 'Paris, France', nbTrades: 76, isPositiveRating: true}
];

class OfferListContainer extends Component {
  render() {
    const {t} = this.props;

    return (<Fragment>
        <Row className="border-bottom mb-3">
          <Col xs={2}>
            <LogoCircle>B</LogoCircle>
          </Col>
          <Col xs={10}>
            <h2>{t('buyer.offerList.bankTransfer')}</h2>
            <p className="text-muted">{t('buyer.offerList.foundOffers', {count: DISTANT_DATA.length})}</p>
          </Col>
        </Row>
        <Row>
          <Col><SorterFilter/></Col>
        </Row>
        {DISTANT_DATA.map((data, idx) => <OfferListing key={'listing-' + idx} assets={data.assets}
                                                       seller={data.seller} location={data.location}
                                                       nbTrades={data.nbTrades}
                                                       isPositiveRating={data.isPositiveRating}/>)}
      </Fragment>
    );
  }
}

OfferListContainer.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(OfferListContainer);
