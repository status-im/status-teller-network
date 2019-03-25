import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import Reputation from '../Reputation';
import Identicon from "../UserInformation/Identicon";

const Offer = ({offer, withDetail}) => (
  <Row className="border bg-white rounded p-2 mr-0 ml-0 mb-2" tag={Link} to={`/profile/${offer.owner}`}>
    <Col className="p-0">
      <Row className="mb-2">
        <Col xs={2}><Identicon seed={offer.owner} className="rounded-circle border" scale={5}/></Col>
        <Col xs={5}>
          <p className="seller-name m-0 font-weight-bold">{offer.user.username}</p>
          <p className="text-dark m-0">{offer.user.location}</p>
        </Col>
        <Col xs={5} className="text-right rating-col">
          <p className="text-dark m-0 text-right mb-1">{"TODO"} trades</p>
          <Reputation reputation={{upCount: offer.user.upCount, downCount: offer.user.downCount}} size="s"/>
        </Col>
      </Row>
      {withDetail && <Row>
        <Col>
          <p className="m-0">
            <span className="border rounded mr-2 font-weight-bold p-1">{offer.token.symbol}</span>
            <span className="border rounded mr-2 font-weight-bold p-1">{offer.currency}</span>
          </p>
        </Col>
      </Row>}
    </Col>
  </Row>

);

Offer.defaultProps = {
  withDetail: false,
  hideIcon: false
};

Offer.propTypes = {
  offer: PropTypes.object,
  withDetail: PropTypes.bool
};


export default Offer;
