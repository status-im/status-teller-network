import React, {Fragment} from 'react';
import {tradeStates} from '../../features/escrow/helpers';
import RoundedIcon from "../../ui/RoundedIcon";
import infoIconRed from "../../../images/exclamation-circle.png";
import infoIconGray from "../../../images/small-info.svg";
import classnames from "classnames";
import {Col, Row} from "reactstrap";
import {limitDecimals} from '../../utils/numbers';
import PropTypes from 'prop-types';

const PERCENTAGE_THRESHOLD = 10; // If asset price is 10% different than the real price, show the warning

const PriceWarning = ({isBuyer = true, escrowStatus = tradeStates.waiting, fiatAmount, tokenAmount, tokenSymbol, fiatSymbol, margin = 0, currentPrice = '0.00'}) => {

  const currentPriceForCurrency = parseFloat(currentPrice).toFixed(4);
  const currentOfferPrice = currentPriceForCurrency * ((margin / 100) + 1);
  const escrowAssetPrice = (fiatAmount / 100) / tokenAmount;
  const rateCurrentAndSellPrice = currentPriceForCurrency / escrowAssetPrice * 100;
  const rateCurrentAndBuyerPrice = ((escrowAssetPrice / currentPriceForCurrency) * 100) - 100;

  const shouldWarnSeller =  !isBuyer && currentOfferPrice < currentPriceForCurrency && rateCurrentAndSellPrice > PERCENTAGE_THRESHOLD;
  const shouldWarnBuyer = isBuyer && escrowAssetPrice > currentPriceForCurrency && rateCurrentAndBuyerPrice > PERCENTAGE_THRESHOLD;

  return <Fragment>
    {escrowStatus === tradeStates.waiting && isBuyer && currentPriceForCurrency &&
      <Fragment>
       {shouldWarnBuyer && <p className="text-danger mb-0 text-small">The price for this trade ({limitDecimals(escrowAssetPrice, 4)} {fiatSymbol}) is {limitDecimals(rateCurrentAndBuyerPrice, 2)}% above the current price for {tokenSymbol} ({limitDecimals(currentPriceForCurrency, 4)} {fiatSymbol})</p> }
        <p className={classnames("text-small", {"text-danger": shouldWarnBuyer, "text-muted": !shouldWarnBuyer})}>
          <RoundedIcon image={shouldWarnBuyer ? infoIconRed : infoIconGray} bbgColor={shouldWarnBuyer ? "red": "secondary"} className="float-left mr-1" size="sm"/>
          <span className="pt-2">Only continue if you are comfortable with this price</span>
        </p>
      </Fragment> }

     {escrowStatus === tradeStates.waiting && !isBuyer && currentPriceForCurrency  &&
     <Fragment>
       {shouldWarnSeller && <p className="text-danger text-small mb-0">
        Your trade price for {tokenSymbol} ({limitDecimals(currentOfferPrice, 4)} {fiatSymbol}) is {limitDecimals(Math.abs(rateCurrentAndBuyerPrice), 2)}% below the current price for {tokenSymbol} ({limitDecimals(currentPriceForCurrency, 4)} {fiatSymbol})
        </p>}
        <p className={classnames("text-small", {"text-danger": shouldWarnSeller, "text-muted": !shouldWarnSeller})}>
          <RoundedIcon image={shouldWarnSeller ? infoIconRed : infoIconGray} bbgColor={shouldWarnSeller ? "red": "secondary"} className="float-left mr-1" size="sm"/>
          <span className="pt-2">Only continue if you are comfortable with this price</span>
        </p>
     </Fragment> }
   </Fragment>;
};

PriceWarning.propTypes = {
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

export default PriceWarning;
