import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Button} from 'reactstrap';
import {truncateTwo} from '../../../utils/numbers';
import {TokenImages} from '../../../utils/images';
import {calculateEscrowPrice} from '../../../utils/transaction';


const Offer = ({offer, prices, onClick, disabled}) => (
  <Row className="border py-2 mx-0 my-2 rounded">
    <Col xs="4" className="v-align-center">
      <p className="font-weight-bold"><img src={TokenImages[`${offer.token.symbol}.png`] || TokenImages[`generic.png`]} alt="asset icon" className="mr-2"/>{offer.token.symbol}</p>
    </Col>
    <Col xs="8" className="v-align-center text-right">
      <Button color={disabled ? "secondary p-2" : "primary p-2" } disabled={disabled} onClick={onClick}>Buy for {truncateTwo(calculateEscrowPrice(offer, prices))} {offer.currency}</Button>
    </Col>
  </Row>
);

Offer.defaultProps = {
  disabled: false
};

Offer.propTypes = {
  offer: PropTypes.object,
  onClick: PropTypes.func,
  prices: PropTypes.object,
  disabled: PropTypes.bool
};

export default Offer;
