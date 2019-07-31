import React, {Fragment} from 'react';
import {Row, Col} from 'reactstrap';
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import moment from "moment";
import {tradeStates} from '../../../features/escrow/helpers';
import NoArbitratorWarning from '../../../components/NoArbitratorWarning';
import { formatArbitratorName } from '../../../utils/strings';
import { zeroAddress } from '../../../utils/address';

const PERCENTAGE_THRESHOLD = 10; // If asset price is 10% different than the real price, show the warning

const getDiff = (rate) => {
  let isAbove = false;
  let diffPercentage = 0;
  if(rate > 1) {
    isAbove = true;
    diffPercentage = (rate * 100) - 100;
  } else {
    diffPercentage = 100 - (rate * 100);
  }

  return {isAbove, diffPercentage};
};


const shouldWarn = (diff, isBuyer) => {
  if(isBuyer && !diff.isAbove && diff.diffPercentage > PERCENTAGE_THRESHOLD) return true;
  if(!isBuyer && diff.isAbove && diff.diffPercentage > PERCENTAGE_THRESHOLD) return true;
  return false;
};


const EscrowDetail = ({escrow, currentPrice, isBuyer}) => {
  const currentPriceForCurrency = parseFloat(currentPrice ? currentPrice[escrow.offer.currency] : null).toFixed(2);
  const currentOfferPrice = currentPriceForCurrency * ((escrow.offer.margin / 100) + 1);
  const escrowAssetPrice = escrow.assetPrice / 100 * ((escrow.offer.margin / 100) + 1);
  const rateCurrentAndSellPrice = currentPriceForCurrency / escrowAssetPrice;
  const rateCurrentAndBuyerPrice = currentOfferPrice / escrowAssetPrice;

  const buyerDiff = getDiff(rateCurrentAndSellPrice);
  const sellerDiff = getDiff(rateCurrentAndBuyerPrice);

  return (<Row className="mt-5">
    <Col xs="2">
      <RoundedIcon icon={faQuestionCircle} bgColor="grey"/>
    </Col>
    <Col xs="10">
      <h5 className="m-0">Trade details</h5>
      <p className="text-dark m-0">{(escrow.tokenAmount * escrowAssetPrice).toFixed(2)} {escrow.offer.currency} for {escrow.tokenAmount} {escrow.token.symbol}</p>
      <p className="text-dark m-0">{escrow.token.symbol} Price = {escrowAssetPrice.toFixed(2)} {escrow.offer.currency}</p>
      {escrow.expirationTime && escrow.expirationTime !== '0' && <p className="text-dark m-0">Expiration time: {moment(escrow.expirationTime * 1000).calendar()}</p>}

      {escrow.status === tradeStates.waiting && isBuyer && currentPriceForCurrency && shouldWarn(buyerDiff, true) &&
       <Fragment>
        <p className="text-danger font-weight-bold mb-0">The current price for {escrow.token.symbol} is {currentPriceForCurrency} {escrow.offer.currency}, which is {buyerDiff.diffPercentage.toFixed(2)}% {buyerDiff.isAbove ? "above" : "below"} the price for this trade ({escrowAssetPrice.toFixed(2)} {escrow.offer.currency})</p>
        <p className="text-danger mb-2">Double-check whether you really want to go through with this trade</p>
      </Fragment> }

      {escrow.status === tradeStates.waiting && !isBuyer && currentPriceForCurrency  && shouldWarn(sellerDiff, false)  &&
      <Fragment>
      <p className="text-danger font-weight-bold mb-0">Your current price for {escrow.token.symbol} in this offer is {currentOfferPrice.toFixed(2)} {escrow.offer.currency} which is {sellerDiff.diffPercentage.toFixed(2)}% {sellerDiff.isAbove ? "above" : "below"} the price for this trade ({escrowAssetPrice.toFixed(2)} {escrow.offer.currency})</p>
      <p className="text-danger mb-2">Double-check whether you really want to go through with this trade</p>
    </Fragment> }
      <NoArbitratorWarning arbitrator={escrow.offer.arbitrator} />
      { escrow.arbitrator !== zeroAddress && <p className="text-dark m-0">Arbitrator: <span className="font-weight-bold">{formatArbitratorName(escrow.arbitratorInfo, escrow.arbitrator)}</span></p>}
      </Col>
  </Row>);
};


EscrowDetail.propTypes = {
  escrow: PropTypes.object,
  currentPrice: PropTypes.object,
  isBuyer: PropTypes.bool
};

export default EscrowDetail;
