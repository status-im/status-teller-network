import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, CardBody, CardTitle, CardFooter} from 'reactstrap';
import {Link} from "react-router-dom";
import Reputation from '../Reputation';
import {truncateTwo} from '../../utils/numbers';
import {calculateEscrowPrice} from '../../utils/transaction';
import classnames from 'classnames';
import {addressCompare, zeroAddress} from '../../utils/address';
import NoArbitratorWarning from "../../components/NoArbitratorWarning";
import {PAYMENT_METHODS} from '../../features/metadata/constants';
import {withNamespaces} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUniversity, faGlobeAmericas, faExchangeAlt} from "@fortawesome/free-solid-svg-icons";

import './index.scss';
import {TokenImages} from "../../utils/images";

const Offer = ({offer, withDetail, prices, userAddress, t, offerClick}) => {
  const isOwner = addressCompare(userAddress, offer.owner);
  const isArbitrator = addressCompare(userAddress, offer.arbitrator);
  const noArbitrator = addressCompare(offer.arbitrator, zeroAddress);

  return (<Card className="mb-3 shadow p- border-0">
    <CardBody>
      <CardTitle tag={Link} to={`/profile/${offer.owner}`} className={classnames('seller-name', 'font-weight-bold', {
        'text-black': !isOwner,
        'text-success': isOwner
      })}>
        {offer.user.username}
      </CardTitle>
      <div>
        <p className="text-black m-0"><FontAwesomeIcon icon={faGlobeAmericas}
                                                       className="text-primary"/> {offer.user.location}</p>
        <p className="text-black m-0"><FontAwesomeIcon icon={faUniversity}
                                                       className="text-primary"/> {offer.paymentMethods.map(paymentMethod => PAYMENT_METHODS[paymentMethod]).join(', ')}
        </p>
        <p className="text-black m-0"><FontAwesomeIcon icon={faExchangeAlt}
                                                       className="text-primary"/> {offer.user.nbReleasedTrades} trade{offer.user.nbReleasedTrades !== 1 && 's'}
        </p>
        <span className="offer-reputation"><Reputation reputation={{averageCount: offer.user.averageCount}} size="s"/></span>

        {isArbitrator > 0 && <p className="text-warning text-small m-0">{t('offer.isArbitrator')}</p>}
        {noArbitrator > 0 && <NoArbitratorWarning arbitrator={zeroAddress} label={t('offer.noArbitrator')}/>}
      </div>
    </CardBody>

    {withDetail && prices && !prices.error &&
    <CardFooter onClick={() => offerClick(offer.id)} className={classnames('bg-white text-right border-0 pt-0 clickable', {
      'text-warning': isArbitrator,
      'text-dark': !isArbitrator && !noArbitrator,
      'text-danger': noArbitrator
    })}>
      <p className="m-0 border-top pt-2">
        Buy <span className="text-black"><img
        src={TokenImages[`${offer.token.symbol}.png`] || TokenImages[`generic.png`]}
        alt={offer.token.symbol + ' icon'}/> {offer.token.symbol}</span> at <span
        className="font-weight-bold text-black">{truncateTwo(calculateEscrowPrice(offer, prices))} {offer.currency}</span>
      </p>
    </CardFooter>}
  </Card>);
};

Offer.defaultProps = {
  withDetail: false
};

Offer.propTypes = {
  t: PropTypes.func,
  offer: PropTypes.object,
  withDetail: PropTypes.bool,
  prices: PropTypes.object,
  userAddress: PropTypes.string,
  offerClick: PropTypes.func
};

export default withNamespaces()(Offer);
