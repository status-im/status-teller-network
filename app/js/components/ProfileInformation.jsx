import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import Blockies from 'react-blockies';

class ProfileInformation extends Component {
  render() {
    return (
      <Row className="my-5 text-center">
        <Col xs="12">
          <Blockies seed={this.props.address} className="rounded-circle"/>
        </Col>
        <Col xs="12">
          <h4 className="font-weight-bold">{this.props.username}</h4>
        </Col>
        <Col xs="12">
          <p className="text-muted">{this.props.address}</p>
        </Col>
      </Row>
    );
  }
}

ProfileInformation.propTypes = {
  address: PropTypes.string,
  username: PropTypes.string
};

export default ProfileInformation;
