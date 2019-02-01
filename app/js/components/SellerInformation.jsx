import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import Blockies from 'react-blockies';
import RatingIcon from './RatingIcon';

class ProfileInformation extends Component {
  render() {
    return (
      <Row className="border-bottom border-top pt-2">
        <Col xs="3">
          <Blockies seed={"0xaD8f60a411fb229836Fe06228B355Ed25bBa2A44"} className="rounded-circle" scale={8}/>
        </Col>
        <Col xs="4">
          <h4 className="font-weight-bold">Denis</h4>
          <p className="text-muted">Collectibles</p>
        </Col>
        <Col xs="5" className="m-auto align-middle">
          <p className="text-muted  m-auto align-middle">250+ trades &bull; <RatingIcon isPositiveRating={true}/></p>
        </Col>
      </Row>
    );
  }
}

ProfileInformation.propTypes = {
};

export default ProfileInformation;
