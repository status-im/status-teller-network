import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import {faTimes} from "@fortawesome/free-solid-svg-icons";

import RoundedIcon from "../../../ui/RoundedIcon";

const CancelEscrow = () => (
  <Row className="mt-4 text-primary">
    <Col xs="2">
      <RoundedIcon icon={faTimes} bgColor="blue"/>
    </Col>
    <Col xs="10" className="my-auto">
      <h6 className="m-0">Cancel Trade</h6>
    </Col>
  </Row>
);

CancelEscrow.propTypes = {
};

export default CancelEscrow;
