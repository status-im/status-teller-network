import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Button} from 'reactstrap';
import {truncateTwo} from '../../../utils/numbers';
import {TokenImages} from '../../../utils/images';
import {calculateEscrowPrice} from '../../../utils/transaction';
import { zeroAddress } from '../../../utils/address';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";


const Offer = ({offer, prices, onClick, disabled}) => (
  <Row className="border py-2 mx-0 my-2 rounded">
    <Col xs="4" className="v-align-center">
      <p className="font-weight-bold"><img src={TokenImages[`${offer.token.symbol}.png`] || TokenImages[`generic.png`]} alt="asset icon" className="mr-2"/>{offer.token.symbol}</p>
    </Col>
    <Col xs="8" className="v-align-center text-right">
      <Button color={disabled ? "secondary" : "primary" } className="p-2" disabled={disabled} onClick={onClick}>Buy for {truncateTwo(calculateEscrowPrice(offer, prices))} {offer.currency}</Button>
    </Col>

    {offer.arbitrator === zeroAddress && <span className="text-danger text-small pl-4 pr-4 mt-2">
        <FontAwesomeIcon className="mr-2" icon={faExclamationTriangle} size="sm"/>
        This offer does not have an arbitrator. Disputes cannot be opened
      </span>}
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
