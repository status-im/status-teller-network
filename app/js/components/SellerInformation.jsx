import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import Blockies from 'react-blockies';
import Reputation from "./Reputation.jsx";

const SellerInformation = ({address, name, reputation}) => (
  <Row className="border rounded py-4 m-0 text-center shadow-sm">
    <Col xs="12">
      <Blockies seed={address} className="rounded-circle border" scale={8}/>
    </Col>
    <Col xs="12">
      <h4 className="font-weight-bold">{name}</h4>
    </Col>
    <Col xs="12">
      <p className="text-muted">{address}</p>
    </Col>
    <Col xs="12">
      <Reputation reputation={reputation}/>
    </Col>
  </Row>
);

SellerInformation.propTypes = {
  address: PropTypes.string,
  name: PropTypes.string,
  reputation: PropTypes.object
};

export default SellerInformation;
