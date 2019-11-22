import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import Reputation from '../../../components/Reputation';
import Identicon from "../../../components/UserInformation/Identicon";
import classnames from 'classnames';

const TradeParticipant = ({profile, address, isBuyer, winner}) => (
  <Row className="border bg-white rounded p-2 mr-0 ml-0 mb-2" tag={Link} to={`/profile/` + address}>
    <Col className="p-0">
      <Row>
        <Col xs={3} md={2} className="text-center">
          <Identicon seed={address} className="rounded-circle border" scale={5}/>
          <span className={classnames("icon-badge", {'seller-text': !isBuyer, 'buyer-text': isBuyer, 'text-success': winner})}>
            {isBuyer ? 'Buyer' : 'Seller'}
          </span>
        </Col>
        <Col xs={4} md={5}>
          <p className={classnames('seller-name', 'm-0', 'font-weight-bold', {'text-success': winner})}>{profile.username}</p>
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
  address: PropTypes.string,
  isBuyer: PropTypes.bool,
  winner: PropTypes.bool
};


export default TradeParticipant;
