import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import Reputation from "../Reputation";
import Address from './Address';
import Identicon from "./Identicon";

const UserInformation = ({identiconSeed, username, reputation, isArbitrator, nbReleasedTrades, nbCreatedTrades}) => (
  <Row className="border rounded py-4 m-0 text-center shadow-sm">
    <Col xs="12">
      <Identicon seed={identiconSeed} className="rounded-circle border" scale={8} />
      {isArbitrator && <span className="arbiterLabel">Arbiter</span>}
    </Col>
    <Col xs="12">
      <h4 className="font-weight-bold">{username}</h4>
    </Col>
    <Col xs="12">
      <p className="text-muted">
        <Address address={identiconSeed} charLength={10} />
      </p>
    </Col>
    <Col xs="12">
      <Reputation reputation={reputation}/>
    </Col>
    {(nbReleasedTrades || nbReleasedTrades === 0) && <Col xs="12" className="text-muted text-small mt-3">{nbReleasedTrades} completed trade{nbReleasedTrades > 1 && 's'}</Col>}
    {(nbCreatedTrades || nbCreatedTrades === 0) && <Col xs="12" className="text-muted text-small">{nbCreatedTrades} created trade{nbCreatedTrades > 1 && 's'}</Col>}
  </Row>);

UserInformation.propTypes = {
  identiconSeed: PropTypes.string,
  username: PropTypes.string,
  reputation: PropTypes.object,
  isArbitrator: PropTypes.bool,
  nbReleasedTrades: PropTypes.number,
  nbCreatedTrades: PropTypes.number
};

export default UserInformation;
