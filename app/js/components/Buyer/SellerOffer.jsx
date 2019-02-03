import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import {Row, Col, Button} from 'reactstrap';

const SellerOfferList = ({asset, min, max, fiat}) => (
  <Row className="border-bottom pb-2 pt-2 m-0">
    <Col xs="2" className="v-align-center">
      <p className="font-weight-bold">{asset}</p>
    </Col>
    <Col xs="6" className="v-align-center">
      <p className="text-muted">Min: {min}{fiat} -  Max: {max}{fiat}</p>
    </Col>
    <Col xs="4" className="v-align-center">
      <Button tag={Link} color="primary" className="w-100" to={`/buy/offer/address/offer-id`}>Buy</Button>
    </Col>
  </Row>
);

SellerOfferList.propTypes = {
  asset: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  fiat: PropTypes.string
};

export default SellerOfferList;
