import React from 'react';
import PropTypes from 'prop-types';
import {Button, Col, Row} from "reactstrap";
import network from '../../features/network';
import {connect} from "react-redux";


const Settings = ({resetState}) => (
  <Row>
    <Col xs="8" className="v-align-center text-right">
      <Button color="secondary" onClick={resetState}>Reset cache</Button>
    </Col>
  </Row>
);

Settings.propTypes = {
  resetState: PropTypes.func
};

export default connect(
  null,
  {
    resetState: network.actions.resetState
  }
)(Settings);
