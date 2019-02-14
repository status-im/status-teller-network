import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Button} from 'reactstrap';

const SellerOfferList = ({asset, min, max, fiat, onClick}) => (
  <Row className="border py-2 mx-0 my-2 rounded">
    <Col xs="4" className="v-align-center">
      <p className="font-weight-bold"><img src={asset.icon} alt="asset icon" className="mr-2"/>{asset.name}</p>
    </Col>
    <Col xs="4" className="v-align-center">
      <p className="text-muted">Min: {min}{fiat}<br/>Max: {max}{fiat}</p>
    </Col>
    <Col xs="4" className="v-align-center">
      <Button color="primary" className="w-100" onClick={onClick}>Buy</Button>
    </Col>
  </Row>
);

SellerOfferList.propTypes = {
  asset: PropTypes.object,
  min: PropTypes.number,
  max: PropTypes.number,
  fiat: PropTypes.string,
  onClick: PropTypes.func
};

export default SellerOfferList;
