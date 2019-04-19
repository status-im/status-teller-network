import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Button} from 'reactstrap';
import {truncateTwo} from '../../../utils/numbers';
import {TokenImages} from '../../../utils/images';


const Offer = ({offer, prices, onClick}) => {
  const price = prices[offer.token.symbol][offer.currency];
  const calcPrice = offer.marketType === "0" ? price * ((100 + (parseFloat(offer.margin))) / 100) : price * parseFloat(offer.margin) / 100;
  return <Row className="border py-2 mx-0 my-2 rounded">
    <Col xs="4" className="v-align-center">
      <p className="font-weight-bold"><img src={TokenImages[`${offer.token.symbol}.png`]} alt="asset icon" className="mr-2"/>{offer.token.symbol}</p>
    </Col>
    <Col xs="8" className="v-align-center text-right">
      <Button color="primary" onClick={onClick}>Buy for {truncateTwo(calcPrice)} {offer.currency}</Button>
    </Col>
  </Row>;
};

Offer.propTypes = {
  offer: PropTypes.object,
  onClick: PropTypes.func,
  prices: PropTypes.object
};

export default Offer;
