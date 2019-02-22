import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import SellerOffer from './SellerOffer';

const SellerOfferList = ({offers, onClick}) => (
  <Row>
    <Col xs="12" className="mt-2">
      <h3>Offers</h3>
      <div>
        {offers.map((offer, index) => <SellerOffer key={index}
                                                   offer={offer}
                                                   onClick={() => onClick(offer.id)}/>)}
      </div>
    </Col>
  </Row>
);

SellerOfferList.propTypes = {
  offers: PropTypes.array,
  onClick: PropTypes.func
};

export default SellerOfferList;
