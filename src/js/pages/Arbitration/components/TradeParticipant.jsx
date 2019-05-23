import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import Reputation from '../../../components/Reputation';
import Identicon from "../../../components/UserInformation/Identicon";

const TradeParticipant = ({profile, address}) => (
  <Row className="border bg-white rounded p-2 mr-0 ml-0 mb-2" tag={Link} to={`/profile/` + address}>
    <Col className="p-0">
      <Row className="mb-2">
        <Col xs={2}><Identicon seed={profile.statusContactCode} className="rounded-circle border" scale={5}/></Col>
        <Col xs={5}>
          <p className="seller-name m-0 font-weight-bold">{profile.username}</p>
          <p className="text-dark m-0">{profile.location}</p>
        </Col>
        <Col xs={5} className="text-right rating-col">
          <p className="text-dark m-0 text-right mb-1">{profile.nbReleasedTrades || 0} trades</p>
          <Reputation reputation={{upCount: profile.reputation.upCount, downCount: profile.reputation.upCount}} size="s"/>
        </Col>
      </Row>
    </Col>
  </Row>

);


TradeParticipant.propTypes = {
  profile: PropTypes.object,
  address: PropTypes.string
};


export default TradeParticipant;
