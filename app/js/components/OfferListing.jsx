import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";

const OfferListing = (props) => (
  <Row className="offer-listing border rounded p-2 mr-0 ml-0 mb-2">
    <Col xs={6}>
      <p className="seller-name m-0 font-weight-bold">{props.seller}</p>
      <p className="text-secondary m-0">
        {props.nbTrades} trades &bull;&nbsp;
        {props.isPositiveRating && <FontAwesomeIcon className="text-warning" icon={faThumbsUp}/>}
        {!props.isPositiveRating && <FontAwesomeIcon className="text-warning" icon={faThumbsDown}/>}
      </p>
    </Col>
    <Col xs={6}>
      <p className="text-secondary m-0">Sells: {props.assets.join(', ')}</p>
      <p className="text-secondary m-0">{props.location}</p>
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
