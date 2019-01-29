import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import Blockies from 'react-blockies';

class ProfileInformation extends Component {
  render() {
    return (
      <Row className="my-5 text-center">
        <Col xs="12">
          <Blockies seed={"denis"} className="rounded-circle"/>
        </Col>
        <Col xs="12">
          <h4 className="font-weight-bold">Denis</h4>
        </Col>
        <Col xs="12">
          <p className="text-muted">0x2376423784623784632784678324</p>
        </Col>
      </Row>
    );
  }
}

ProfileInformation.propTypes = {
};

export default ProfileInformation;
