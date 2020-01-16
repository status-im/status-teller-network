import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {Card, CardBody, CardTitle, CardFooter} from 'reactstrap';
import Reputation from '../Reputation';
import {limitDecimals, formatFiatPrice} from '../../utils/numbers';
import {calculateEscrowPrice} from '../../utils/transaction';
import classnames from 'classnames';
import {addressCompare, zeroAddress} from '../../utils/address';
import NoArbitratorWarning from "../../components/NoArbitratorWarning";
import {PAYMENT_METHODS} from '../../features/metadata/constants';
import {withTranslation} from "react-i18next";
import limitIcon from '../../../images/limits.svg';
import bankIcon from '../../../images/bank.svg';
import chatIcon from '../../../images/read-chat.svg';
import {CURRENCY_DATA} from "../../constants/currencies";
import {getTokenImage} from "../../utils/images";
import RoundedIcon from "../../ui/RoundedIcon";
import {stringToContact} from "../../utils/strings";

import infoRedIcon from "../../../images/info-red.svg";

import './index.scss';

// eslint-disable-next-line complexity
const Offer = ({offer, withDetail, prices, userAddress, t, offerClick, showCommunicationMethod, numberPaymentMethodsShown, paymentMethodFilter}) => {
  const isOwner = addressCompare(userAddress, offer.owner);
  const isArbitrator = addressCompare(userAddress, offer.arbitrator);
  const noArbitrator = addressCompare(offer.arbitrator, zeroAddress);
  const limitless = (!offer.limitL || offer.limitL === '0') && (!offer.limitU || offer.limitU === '0');

  let currencySymbol = CURRENCY_DATA.find(curr => curr.id === offer.currency);
  if (!currencySymbol) {
    currencySymbol = offer.currency;
  } else {
    currencySymbol = currencySymbol.symbol;
  }

  const paymentMethods = offer.paymentMethods;
  if (paymentMethodFilter !== -1) {
    paymentMethods.sort((a, b) => {
      if (a === paymentMethodFilter) {
        return -1;
      }
      if (b === paymentMethodFilter) {
        return 1;
      }
      return 0;
    });
  }

  return (<Card className="mb-3 shadow border-0 offer-card clickable" onClick={() => offerClick(offer.id)}>
    <CardBody>
      <CardTitle className="seller-name">
        {offer.user.username}
      </CardTitle>
      <div>
        {offer.user.countryCode && offer.user.location && <p className="text-black m-0 mt-2 clearfix data-item">
          <span className={`mr-2 ml-1 flag-icon flag-icon-${offer.user.countryCode.toLowerCase()}`}/>
          {offer.user.location}
        </p>}
        <p className="text-black m-0 mt-2 clearfix data-item">
          <RoundedIcon image={bankIcon} size="sm" bgColor="blue" className="mr-2 float-left"/>
          {paymentMethods.map((paymentMethod, index) => {
            if (index >= numberPaymentMethodsShown) {
              return '';
            }
            const showComma = !(index === paymentMethods.length - 1 || index === numberPaymentMethodsShown - 1);
            if (index === 0 && paymentMethodFilter !== -1) {
              return (<Fragment key={'method-' + index}>
                <span className="font-weight-bold">
                  {PAYMENT_METHODS[paymentMethod]}
                </span>
                {showComma && ', '}
              </Fragment>);
            }
            return PAYMENT_METHODS[paymentMethod] + (showComma ? ', ' : '');
          })}
          {paymentMethods.length > numberPaymentMethodsShown && ' ' + t('offer.andMore')}
        </p>

        {!limitless && <p className="text-black m-0 mt-2 clearfix data-item">
          <RoundedIcon image={limitIcon} size="sm" bgColor="blue" className="mr-2 float-left"/>
          {limitDecimals(parseFloat(offer.limitL)/100, 2)}{currencySymbol} to {limitDecimals(parseFloat(offer.limitU)/100, 2)}{currencySymbol}
        </p>}

        {limitless && <p className="text-black m-0 mt-2 clearfix data-item">
          <RoundedIcon image={limitIcon} size="sm" bgColor="blue" className="mr-2 float-left"/>
          No limits
        </p>}

        {showCommunicationMethod && <p className="text-black mb-3 mt-2 clearfix data-item">
          <RoundedIcon image={chatIcon} size="sm" bgColor="blue" className="mr-2 float-left"/>
          {stringToContact(offer.user.contactData).method}
        </p>}

        {noArbitrator > 0 && <NoArbitratorWarning arbitrator={zeroAddress} label={t('offer.noArbitrator')}/>}
        {(isOwner || isArbitrator) && <p className="text-danger text-right mb-2">
          {isOwner && t('offer.isOwner')}
          {isArbitrator && t('offer.isArbitrator')}
          <RoundedIcon className="d-inline-block ml-2" image={infoRedIcon} bgColor="red" size="sm"/>
        </p>}

        <span className="offer-reputation">
          <Reputation reputation={{averageCount: offer.user.averageCountBase10}} size="s"/>
        </span>
      </div>
    </CardBody>

    {withDetail && prices && !prices.error &&
    <CardFooter className={classnames('bg-white text-right border-0 pt-0 clickable', {
                  'text-dark': !isArbitrator && !noArbitrator,
                  'text-danger': noArbitrator
                })}>
      <p className="m-0 border-top pt-2">
        Buy <span className="text-black"><img
        src={getTokenImage(offer.token.symbol)}
        alt={offer.token.symbol + ' icon'}/> {offer.token.symbol}</span> at <span
        className="font-weight-bold text-black">{formatFiatPrice(calculateEscrowPrice(offer, prices))} {offer.currency}</span>
      </p>
    </CardFooter>}
  </Card>);
};

Offer.defaultProps = {
  withDetail: false,
  numberPaymentMethodsShown: 2,
  paymentMethodFilter: -1
};

Offer.propTypes = {
  t: PropTypes.func,
  offer: PropTypes.object,
  withDetail: PropTypes.bool,
  numberPaymentMethodsShown: PropTypes.number,
  paymentMethodFilter: PropTypes.number,
  showCommunicationMethod: PropTypes.bool,
  prices: PropTypes.object,
  userAddress: PropTypes.string,
  offerClick: PropTypes.func
};

export default withTranslation()(Offer);
