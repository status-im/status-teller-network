import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import Reputation from '../Reputation';
import Identicon from "../UserInformation/Identicon";
import {truncateTwo} from '../../utils/numbers';
import {calculateEscrowPrice} from '../../utils/transaction';

import './index.scss';

const Offer = ({offer, withDetail, prices}) => (
  <Row className="border bg-white rounded p-3 mr-0 ml-0 mb-2" tag={Link} to={`/profile/${offer.owner}`}>
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
            <span className="border rounded mr-2 p-1 font-weight-normal text-dark">{offer.token.symbol} &rarr; {truncateTwo(calculateEscrowPrice(offer, prices))} {offer.currency}</span>
          </p>
        </Col>
      </Row>}
    </Col>
  </Row>
);

Offer.defaultProps = {
  withDetail: false
};

Offer.propTypes = {
  offer: PropTypes.object,
  withDetail: PropTypes.bool,
  prices: PropTypes.object
};


export default Offer;
