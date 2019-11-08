import React, {Fragment} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from "moment";
import {tradeStates} from '../../../features/escrow/helpers';
import Identicon from "../../../components/UserInformation/Identicon";
import Address from "../../../components/UserInformation/Address";
import { formatArbitratorName } from '../../../utils/strings';
import {PAYMENT_METHODS} from '../../../features/metadata/constants';


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
  const currentPriceForCurrency = parseFloat(currentPrice ? currentPrice[escrow.offer.currency] : null).toFixed(4);
  const currentOfferPrice = currentPriceForCurrency * ((escrow.offer.margin / 100) + 1);
  const escrowAssetPrice = (escrow.fiatAmount / 100) / escrow.tokenAmount;
  const rateCurrentAndSellPrice = currentPriceForCurrency / escrowAssetPrice;
  const rateCurrentAndBuyerPrice = currentOfferPrice / escrowAssetPrice;

  const buyerDiff = getDiff(rateCurrentAndSellPrice);
  const sellerDiff = getDiff(rateCurrentAndBuyerPrice);

  return <div className="escrowDetails">
      <h2 className="mt-5">Trade Details</h2>
      <h3 className="font-weight-normal mt-4">Trade Amount</h3>
      <p className="font-weight-medium mb-1">
        {(escrow.fiatAmount / 100).toFixed(2)} {escrow.offer.currency} for {escrow.tokenAmount} {escrow.token.symbol}
      </p>

      <h3 className="font-weight-normal mt-4">Price</h3>
      <p className="font-weight-medium mb-1">
        1 {escrow.token.symbol} = {escrowAssetPrice.toFixed(4)} {escrow.offer.currency}
      </p>

      <h3 className="font-weight-normal mt-4">Payment Method</h3>
      <p className="font-weight-medium mb-1">
        {
          escrow.offer.paymentMethods.map(x => PAYMENT_METHODS[x]).join(', ')
        }
      </p>

      <h3 className="font-weight-normal mt-4">Trade Location</h3>
      <p className="font-weight-medium mb-1">
        {escrow.seller.location}
      </p>

      {isBuyer && <Fragment>
        <h3 className="mt-4 font-weight-normal">Seller</h3>
        <p className="mt-2 font-weight-medium mb-1">
          <Identicon seed={escrow.seller.statusContactCode} className="rounded-circle border mr-2 float-left" scale={5}/>
          {escrow.seller.username}
        </p>
        <p className="text-muted text-small addr"><Address address={escrow.seller.statusContactCode} length={6}/></p>
      </Fragment>}

      {!isBuyer && <Fragment>
        <h3 className="mt-4 font-weight-normal">Buyer</h3>
        <p className="mt-2 font-weight-medium mb-1">
          <Identicon seed={escrow.buyerInfo.statusContactCode} className="rounded-circle border mr-2 float-left" scale={5}/>
          {escrow.buyerInfo.username}
        </p>
        <p className="text-muted text-small addr"><Address address={escrow.buyerInfo.statusContactCode} length={6}/></p>
      </Fragment>}

      <h3 className="mt-4 font-weight-normal">Arbitrator</h3>
      <p className="mt-2 font-weight-medium mb-1">
        <Identicon seed={escrow.arbitratorInfo.statusContactCode} className="rounded-circle border mr-2 float-left" scale={5}/>
        {formatArbitratorName(escrow.arbitratorInfo, escrow.arbitrator)}
      </p>
      <p className="text-muted text-small addr"><Address address={escrow.arbitratorInfo.statusContactCode} length={6}/></p>
     

    <Row className="mt-4">
    <Col xs="12">
      {escrow.expirationTime && escrow.expirationTime !== '0' && <p className="text-dark m-0">Expiration time: {moment(escrow.expirationTime * 1000).calendar()}</p>}

      {escrow.status === tradeStates.waiting && isBuyer && currentPriceForCurrency && shouldWarn(buyerDiff, true) &&
       <Fragment>
        <p className="text-danger font-weight-bold mb-0">The current price for {escrow.token.symbol} is {currentPriceForCurrency} {escrow.offer.currency}, which is {buyerDiff.diffPercentage.toFixed(2)}% {buyerDiff.isAbove ? "above" : "below"} the price for this trade ({escrowAssetPrice.toFixed(4)} {escrow.offer.currency})</p>
        <p className="text-danger mb-2">Double-check whether you really want to go through with this trade</p>
      </Fragment> }

      {escrow.status === tradeStates.waiting && !isBuyer && currentPriceForCurrency  && shouldWarn(sellerDiff, false)  &&
      <Fragment>
      <p className="text-danger font-weight-bold mb-0">Your current price for {escrow.token.symbol} in this offer is {currentOfferPrice.toFixed(2)} {escrow.offer.currency} which is {sellerDiff.diffPercentage.toFixed(2)}% {sellerDiff.isAbove ? "above" : "below"} the price for this trade ({escrowAssetPrice.toFixed(2)} {escrow.offer.currency})</p>
      <p className="text-danger mb-2">Double-check whether you really want to go through with this trade</p>
    </Fragment> }
      </Col>
  </Row>
  </div>;
};


EscrowDetail.propTypes = {
  escrow: PropTypes.object,
  currentPrice: PropTypes.object,
  isBuyer: PropTypes.bool
};

export default EscrowDetail;
