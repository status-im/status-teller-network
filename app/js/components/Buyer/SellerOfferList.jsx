import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import SellerOffer from './SellerOffer';

const SellerOfferList = ({offers}) => (
  <Row>
    <Col xs="12" className="mt-3">
      <h3>Selling</h3>
      <div className="border-top">
        {offers.map((offer, idx) => <SellerOffer key={'offer-' + idx} fiat={offer.fiat} asset={offer.asset}
                                                 max={offer.max} min={offer.min}/>)}
      </div>
    </Col>
  </Row>
);

SellerOfferList.propTypes = {
  offers: PropTypes.array
};

export default SellerOfferList;
