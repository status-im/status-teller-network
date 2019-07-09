import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import Reputation from '../Reputation';
import Identicon from "../UserInformation/Identicon";
import {truncateTwo} from '../../utils/numbers';
import {calculateEscrowPrice} from '../../utils/transaction';
import classnames from 'classnames';
import {addressCompare, zeroAddress} from '../../utils/address';
import NoArbitratorWarning from "../../components/NoArbitratorWarning";

const Offer = ({offer, offers, withDetail, prices, userAddress}) => {
  let user;
  let owner;

  if (!offer) {
    if (!offers) {
      throw new Error('Component needs either offer or offers');
    }
    user = offers[0].user;
    owner = offers[0].owner;
  } else {
    user = offer.user;
    owner = offer.owner;
    offers = [offer];
  }
  const isOwner = addressCompare(userAddress, owner);
  let nbOffersArbitrator = 0;
  let nbOffersNoArbitrator = 0;

  return (<Row className="border bg-white rounded p-3 mr-0 ml-0 mb-2" tag={Link} to={`/profile/${owner}`}>
    <Col className="p-0">
      <Row className="mb-2">
        <Col xs={2}><Identicon seed={user.statusContactCode || owner} className="rounded-circle border" scale={5}/></Col>
        <Col xs={5}>
          <p className={classnames('seller-name', 'm-0', 'font-weight-bold', {
            'text-black': !isOwner,
            'text-success': isOwner
          })}>{user.username}</p>
          <p className="text-dark m-0">{user.location}</p>
        </Col>
        <Col xs={5} className="text-right rating-col">
          <p className="text-dark m-0 text-right mb-1">{user.nbReleasedTrades} trade{user.nbReleasedTrades !== 1 && 's'}</p>
          <Reputation reputation={{upCount: user.upCount, downCount: user.downCount}} size="s"/>
        </Col>
      </Row>
      {withDetail && <Row>
        <Col>
          <p className="m-0">
            {offers.map((offer, index) => {
              const isArbitrator = addressCompare(userAddress, offer.arbitrator);
              const noArbitrator = addressCompare(offer.arbitrator, zeroAddress);
              if (isArbitrator) nbOffersArbitrator++;
              if (noArbitrator) nbOffersNoArbitrator++;
              return <span key={`offer-${index}`}
                           className={classnames("border d-inline-block rounded mr-2 p-1 font-weight-medium text-small", {'text-warning': isArbitrator, 'text-black': !isArbitrator && !noArbitrator, 'text-danger': noArbitrator})}>
              {offer.token.symbol} &rarr; {truncateTwo(calculateEscrowPrice(offer, prices))} {offer.currency}
            </span>;
            })}
          </p>
        </Col>
      </Row>}
      {nbOffersArbitrator > 0 && <span className="text-warning text-small">You are an arbitrator on {nbOffersArbitrator} offer{nbOffersArbitrator > 1 && 's'}</span>}
      {nbOffersNoArbitrator > 0 && <NoArbitratorWarning arbitrator={zeroAddress} label="Some offers do not have an arbitrator assigned" />}
    </Col>
  </Row>);
};

Offer.defaultProps = {
  withDetail: false
};

Offer.propTypes = {
  offer: PropTypes.object,
  withDetail: PropTypes.bool,
  prices: PropTypes.object,
  offers: PropTypes.array,
  userAddress: PropTypes.string
};


export default Offer;
