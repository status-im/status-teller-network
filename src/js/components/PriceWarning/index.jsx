/* eslint-disable complexity */
import React, {Fragment} from 'react';
import {tradeStates} from '../../features/escrow/helpers';
import RoundedIcon from "../../ui/RoundedIcon";
import infoIconRed from "../../../images/exclamation-circle.png";
import infoIconGray from "../../../images/small-info.svg";
import iconGreen from "../../../images/green-check.svg";

import classnames from "classnames";
import {limitDecimals} from '../../utils/numbers';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";

const PERCENTAGE_THRESHOLD = 10; // If asset price is 10% different than the real price, show the warning

const PriceWarning = ({t, hideDefaultText, isBuyer = true, escrowStatus = tradeStates.waiting, fiatAmount, tokenAmount, tokenSymbol, fiatSymbol, margin = 0, currentPrice = '0.00'}) => {
  const currentPriceForCurrency = parseFloat(currentPrice).toFixed(4);
  const currentOfferPrice = currentPriceForCurrency * ((margin / 100) + 1);
  const escrowAssetPrice = (fiatAmount / 100) / tokenAmount;
  const rateCurrentAndSellPrice = currentPriceForCurrency / escrowAssetPrice * 100;
  const rateCurrentAndBuyerPrice = ((escrowAssetPrice / currentPriceForCurrency) * 100) - 100;

  const shouldWarnSeller = !isBuyer && currentOfferPrice < currentPriceForCurrency && rateCurrentAndSellPrice > PERCENTAGE_THRESHOLD;
  const shouldWarnBuyer = isBuyer && escrowAssetPrice > currentPriceForCurrency && rateCurrentAndBuyerPrice > PERCENTAGE_THRESHOLD;
  const greatPriceForBuyer = isBuyer && escrowAssetPrice < currentPriceForCurrency && rateCurrentAndBuyerPrice <= 1;

return <Fragment>
    {escrowStatus === tradeStates.waiting && isBuyer && currentPriceForCurrency &&
    <Fragment>
      {shouldWarnBuyer && <p className="text-danger mb-0 text-small">
        {t('priceWarning.aboveWarning', {
          price: limitDecimals(escrowAssetPrice, 4),
          fiatSymbol,
          margin: limitDecimals(rateCurrentAndBuyerPrice, 2),
          tokenSymbol,
          currentPrice: limitDecimals(currentPriceForCurrency, 4)
        })}
      </p>}
      
      {((!hideDefaultText && !greatPriceForBuyer) || shouldWarnBuyer) && <p className={classnames("text-small", {"text-danger": shouldWarnBuyer, "text-muted": !shouldWarnBuyer})}>
        <RoundedIcon image={shouldWarnBuyer ? infoIconRed : infoIconGray}
                     bbgColor={shouldWarnBuyer ? "red" : "secondary"} className="float-left mr-1" size="sm"/>
        <span className="pt-2">{t('priceWarning.onlyContinueIf')}</span>
      </p>}
    </Fragment>}

    {greatPriceForBuyer && <Fragment>
      <p className="text-success mb-0 text-small">
        {t('priceWarning.belowWarning', {
          price: limitDecimals(escrowAssetPrice, 4),
          fiatSymbol,
          margin: limitDecimals(rateCurrentAndBuyerPrice, 2),
          tokenSymbol,
          currentPrice: limitDecimals(currentPriceForCurrency, 4)
        })}
      </p>
      <p className={classnames("text-small",'text-success')}>
        <RoundedIcon image={iconGreen}
                     bgColor={"green"} className="float-left mr-1" size="sm"/>
        <span className="pt-2">This is a great price</span>
      </p>
    </Fragment>}

    {escrowStatus === tradeStates.waiting && !isBuyer && currentPriceForCurrency &&
    <Fragment>
      {shouldWarnSeller && <p className="text-danger text-small mb-0">
        {t('priceWarning.belowWarning', {
          price: limitDecimals(escrowAssetPrice, 4),
          fiatSymbol,
          margin: limitDecimals(rateCurrentAndBuyerPrice, 2),
          tokenSymbol,
          currentPrice: limitDecimals(currentPriceForCurrency, 4)
        })}
      </p>}

      
      {(!hideDefaultText || shouldWarnSeller) && <p className={classnames("text-small", {"text-danger": shouldWarnSeller, "text-muted": !shouldWarnSeller})}>
        <RoundedIcon image={shouldWarnSeller ? infoIconRed : infoIconGray}
                     bbgColor={shouldWarnSeller ? "red" : "secondary"} className="float-left mr-1" size="sm"/>
        <span className="pt-2">{t('priceWarning.onlyContinueIf')}</span>
      </p>}

    </Fragment>}
  </Fragment>;
};

PriceWarning.defaultProps = {
  hideDefaultText: false
};

PriceWarning.propTypes = {
  t: PropTypes.func,
  hideDefaultText: PropTypes.bool,
  isBuyer: PropTypes.bool,
  escrowStatus: PropTypes.string,
  fiatAmount: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  tokenAmount: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  tokenSymbol: PropTypes.string,
  fiatSymbol: PropTypes.string,
  margin: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  currentPrice: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

export default withTranslation()(PriceWarning);
