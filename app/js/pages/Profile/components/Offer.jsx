import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Button} from 'reactstrap';

import {TokenImages} from '../../../utils/images';

const Offer = ({offer, onClick}) => (
  <Row className="border py-2 mx-0 my-2 rounded">
    <Col xs="6" className="v-align-center">
      <p className="font-weight-bold"><img src={TokenImages[`${offer.token.symbol}.png`]} alt="asset icon" className="mr-2"/>{offer.token.symbol}</p>
    </Col>
    <Col xs="6" className="v-align-center">
      <Button color="primary" className="w-100" onClick={onClick}>Buy</Button>
    </Col>
  </Row>
);

Offer.propTypes = {
  offer: PropTypes.object,
  onClick: PropTypes.func
};

export default Offer;
