import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import RatingIcon from './RatingIcon';
import {Link} from "react-router-dom";
import Blockies from "react-blockies";

const OfferListing = ({positiveRatings, negativeRating, nbTrades, seller, assets, location, address = '0x0'}) => (
  <Row className="offer-listing rounded p-2 mr-0 ml-0 mb-2" tag={Link} to={`/buy/profile/${address}`}>
    <Col className="p-0">
      <Row>
        <Col xs={2}><Blockies seed={address} className="rounded-circle" scale={6}/></Col>
        <Col xs={5}>
          <p className="seller-name m-0 font-weight-bold">{seller}</p>
          <p className="text-secondary m-0">{location}</p>
        </Col>
        <Col xs={5} className="text-right">
          <p className="text-secondary m-0 text-right">{nbTrades} trades</p>
          <span className="rating-container">
            <span className="bg-secondary py-1 px-2 mr-1">{positiveRatings} <RatingIcon isPositiveRating={true}/></span>
            <span className="bg-secondary py-1 px-2">{negativeRating} <RatingIcon isPositiveRating={false}/></span>
          </span>
        </Col>
      </Row>
      <Row>
        <Col>
          <p className="m-0">{assets.map((asset, idx) => (
            <span className="border rounded mr-2 font-weight-bold p-1"
                  key={'asset-' + idx}>{asset.name} &rarr; {asset.price}$</span>))}</p>
        </Col>
      </Row>
    </Col>
  </Row>

);


OfferListing.propTypes = {
  seller: PropTypes.string,
  nbTrades: PropTypes.number,
  positiveRatings: PropTypes.number,
  negativeRating: PropTypes.number,
  assets: PropTypes.array,
  location: PropTypes.string,
  address: PropTypes.string
};


export default OfferListing;
