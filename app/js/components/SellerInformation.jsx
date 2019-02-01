import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import Blockies from 'react-blockies';
import RatingIcon from './RatingIcon';

const ProfileInformation = ({address, name, isPositiveRating, nbTrades, type}) => (
  <Row className="border-bottom border-top pt-2">
    <Col xs="3">
      <Blockies seed={address} className="rounded-circle" scale={8}/>
    </Col>
    <Col xs="4">
      <h4 className="font-weight-bold">{name}</h4>
      <p className="text-muted">{type}</p>
    </Col>
    <Col xs="5" className="v-align-center">
      <p className="text-muted">{nbTrades} trades &bull; <RatingIcon isPositiveRating={isPositiveRating}/></p>
    </Col>
  </Row>
);

ProfileInformation.propTypes = {
  address: PropTypes.string,
  name: PropTypes.string,
  isPositiveRating: PropTypes.bool,
  nbTrades: PropTypes.number,
  type: PropTypes.string
};

export default ProfileInformation;
