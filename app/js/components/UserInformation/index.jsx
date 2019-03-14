import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import Blockies from 'react-blockies';
import Reputation from "../Reputation";
import Address from './Address';

const UserInformation = ({address, username, reputation, isArbitrator}) => (
  <Row className="border rounded py-4 m-0 text-center shadow-sm">
    <Col xs="12">
      <Blockies seed={address} className="rounded-circle border" scale={8}/>
      {isArbitrator && <span className="arbiterLabel">Arbiter</span>}
    </Col>
    { !isArbitrator && <Col xs="12">
      <h4 className="font-weight-bold">{username}</h4>
    </Col>}
    <Col xs="12">
      <p className="text-muted">
        <Address address={address}/>
      </p>
    </Col>
    { !isArbitrator && <Col xs="12">
      <Reputation reputation={reputation}/>
    </Col>}
  </Row>);

UserInformation.propTypes = {
  address: PropTypes.string,
  username: PropTypes.string,
  reputation: PropTypes.object,
  isArbitrator: PropTypes.bool
};

export default UserInformation;
