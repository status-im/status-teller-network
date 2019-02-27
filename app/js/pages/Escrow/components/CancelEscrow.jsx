import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import {faTimes} from "@fortawesome/free-solid-svg-icons";

import RoundedIcon from "../../../ui/RoundedIcon";

const CancelEscrow = () => (
  <Row className="mt-4">
    <Col xs="2">
      <RoundedIcon icon={faTimes} bgColor="blue"/>
    </Col>
    <Col xs="10">
      <h5>Cancel Trade</h5>
    </Col>
  </Row>
);

CancelEscrow.propTypes = {
};

export default CancelEscrow;
