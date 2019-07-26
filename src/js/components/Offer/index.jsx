import React from 'react';
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

const Offer = ({offer, withDetail, prices, userAddress, t}) => {
  const isOwner = addressCompare(userAddress, offer.owner);
  const isArbitrator = addressCompare(userAddress, offer.arbitrator);
  const noArbitrator = addressCompare(offer.arbitrator, zeroAddress);

  return (<Card tag={Link} to={`/profile/${offer.owner}`} className="mb-3">
    <CardBody>
      <CardTitle className={classnames('seller-name', 'font-weight-bold', {
        'text-black': !isOwner,
        'text-success': isOwner
      })}>
        {offer.user.username}
      </CardTitle>
      <div>
        <p className="text-black m-0"><FontAwesomeIcon icon={faGlobeAmericas} className="text-primary"/> {offer.user.location}</p>
        <p className="text-black m-0"><FontAwesomeIcon icon={faUniversity}  className="text-primary"/> {offer.paymentMethods.map(paymentMethod => PAYMENT_METHODS[paymentMethod]).join(', ')}</p>
        <p className="text-black m-0"><FontAwesomeIcon icon={faExchangeAlt}  className="text-primary"/> {offer.user.nbReleasedTrades} trade{offer.user.nbReleasedTrades !== 1 && 's'}</p>
        <span className="offer-reputation"><Reputation reputation={{upCount: offer.user.upCount, downCount: offer.user.downCount}} size="s"/></span>

        {isArbitrator > 0 && <p className="text-warning text-small m-0">{t('offer.isArbitrator')}</p>}
        {noArbitrator > 0 && <NoArbitratorWarning arbitrator={zeroAddress} label={t('offer.noArbitrator')}/>}
      </div>
    </CardBody>

    {withDetail && prices && !prices.error &&
    <CardFooter className={classnames('bg-white text-right', {
      'text-warning': isArbitrator,
      'text-dark': !isArbitrator && !noArbitrator,
      'text-danger': noArbitrator
    })}>
      Buy <span className="text-black">{offer.token.symbol}</span> at <span className="font-weight-bold text-black">{truncateTwo(calculateEscrowPrice(offer, prices))} {offer.currency}</span>
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
  userAddress: PropTypes.string
};


export default withNamespaces()(Offer);
