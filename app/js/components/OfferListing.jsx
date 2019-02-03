import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import RatingIcon from './RatingIcon';

const OfferListing = ({isPositiveRating, nbTrades, seller, assets, location}) => (
  <Row className="offer-listing border rounded p-2 mr-0 ml-0 mb-2">
    <Col xs={6}>
      <p className="seller-name m-0 font-weight-bold">{seller}</p>
      <p className="text-secondary m-0">
        {nbTrades} trades &bull;&nbsp;
        <RatingIcon isPositiveRating={isPositiveRating}/>
      </p>
    </Col>
    <Col xs={6}>
      <p className="text-secondary m-0">Sells: {assets.join(', ')}</p>
      <p className="text-secondary m-0">{location}</p>
    </Col>
  </Row>
);


OfferListing.propTypes = {
  seller: PropTypes.string,
  nbTrades: PropTypes.number,
  isPositiveRating: PropTypes.bool,
  assets: PropTypes.array,
  location: PropTypes.string
};


export default OfferListing;
