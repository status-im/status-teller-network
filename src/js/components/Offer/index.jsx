import React from 'react';
import PropTypes from 'prop-types';
import {Card, CardBody, CardTitle, CardFooter} from 'reactstrap';
import Reputation from '../Reputation';
import {truncateTwo, limitDecimals} from '../../utils/numbers';
import {calculateEscrowPrice} from '../../utils/transaction';
import classnames from 'classnames';
import {addressCompare, zeroAddress} from '../../utils/address';
import NoArbitratorWarning from "../../components/NoArbitratorWarning";
import {PAYMENT_METHODS} from '../../features/metadata/constants';
import {withNamespaces} from "react-i18next";
import {faGlobeAmericas} from "@fortawesome/free-solid-svg-icons";
import limitIcon from '../../../images/limits.svg';
import bankIcon from '../../../images/bank.svg';
import {CURRENCY_DATA} from "../../constants/currencies";
import './index.scss';
import {getTokenImage} from "../../utils/images";
import RoundedIcon from "../../ui/RoundedIcon";

const Offer = ({offer, withDetail, prices, userAddress, t, offerClick}) => {
  const isOwner = addressCompare(userAddress, offer.owner);
  const isArbitrator = addressCompare(userAddress, offer.arbitrator);
  const noArbitrator = addressCompare(offer.arbitrator, zeroAddress);
  const limitless = offer.limitL === '0' && offer.limitH === '0';

  let currencySymbol = CURRENCY_DATA.find(curr => curr.id === offer.currency);
  if (!currencySymbol) {
    currencySymbol = offer.currency;
  } else {
    currencySymbol = currencySymbol.symbol;
  }

  return (<Card className="mb-3 shadow border-0 offer-card" onClick={() => offerClick(offer.id)}>
    <CardBody>
      <CardTitle className={classnames('seller-name', 'font-weight-bold', {
        'text-black': !isOwner,
        'text-success': isOwner
      })}>
        {offer.user.username}
      </CardTitle>
      <div>
        <p className="text-black m-0 mt-2 clearfix">
          <RoundedIcon icon={faGlobeAmericas} size="sm" bgColor="blue" className="mr-2 float-left"/>
          {offer.user.location}
        </p>
        <p className="text-black m-0 mt-2 clearfix">
          <RoundedIcon image={bankIcon} size="sm" bgColor="blue" className="mr-2 float-left"/>
          {offer.paymentMethods.map(paymentMethod => PAYMENT_METHODS[paymentMethod]).join(', ')}
        </p>
        
        {!limitless && <p className="text-black m-0 mt-2 clearfix">
          <RoundedIcon image={limitIcon} size="sm" bgColor="blue" className="mr-2 float-left"/>
          {limitDecimals(parseFloat(offer.limitL)/100, 2)}{currencySymbol} to {limitDecimals(parseFloat(offer.limitH)/100, 2)}{currencySymbol}
        </p>}

        {limitless && <p className="text-black m-0 mt-2 clearfix">
          <RoundedIcon image={limitIcon} size="sm" bgColor="blue" className="mr-2 float-left"/>
          No limits
        </p>}

        {isArbitrator > 0 && <p className="text-warning text-small m-0">{t('offer.isArbitrator')}</p>}
        {noArbitrator > 0 && <NoArbitratorWarning arbitrator={zeroAddress} label={t('offer.noArbitrator')}/>}

        <span className="offer-reputation">
          <Reputation reputation={{averageCount: offer.user.averageCountBase10}} size="s"/>
        </span>
      </div>
    </CardBody>

    {withDetail && prices && !prices.error &&
    <CardFooter className={classnames('bg-white text-right border-0 pt-0 clickable', {
                  'text-warning': isArbitrator,
                  'text-dark': !isArbitrator && !noArbitrator,
                  'text-danger': noArbitrator
                })}>
      <p className="m-0 border-top pt-2">
        Buy <span className="text-black"><img
        src={getTokenImage(offer.token.symbol)}
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
