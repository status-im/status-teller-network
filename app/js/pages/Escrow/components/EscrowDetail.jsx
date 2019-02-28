import React from 'react';
import {Row, Col} from 'reactstrap';
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";

import RoundedIcon from "../../../ui/RoundedIcon";

const EscrowDetail = () => (
  <Row className="mt-4">
    <Col xs="2">
      <RoundedIcon icon={faQuestionCircle} bgColor="grey"/>
    </Col>
    <Col xs="10">
      <h5 className="m-0">Trade details</h5>
      <p className="text-dark m-0">200 EUR for 2 ETH</p>
      <p className="text-dark m-0">ETH Price = 100 EUR</p>
    </Col>
  </Row>
);

export default EscrowDetail;
