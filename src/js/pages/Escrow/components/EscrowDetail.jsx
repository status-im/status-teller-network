import React, {Fragment} from 'react';
import {Row, Col} from 'reactstrap';
import {faQuestionCircle, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import moment from "moment";
import {tradeStates} from '../../../features/escrow/helpers';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {zeroAddress} from '../../../utils/address';

const PERCENTAGE_THRESHOLD = 10; // If asset price is 10% different than the real price, show the warning

const EscrowDetail = ({escrow, currentPrice}) => {
  const currentPriceForCurrency = parseFloat(currentPrice ? currentPrice[escrow.offer.currency] : null).toFixed(2);
  const escrowAssetPrice = escrow.assetPrice / 100 * ((escrow.offer.margin / 100) + 1);
  const rateCurrentAndSellPrice = escrowAssetPrice / currentPriceForCurrency;

  let isAbove = false;
  let diffPercentage = 0;
  if(rateCurrentAndSellPrice > 1){
    diffPercentage = 100 - (1 / rateCurrentAndSellPrice * 100);
  } else {
    isAbove = true;
    diffPercentage = 100 - (rateCurrentAndSellPrice * 100);
  }

  console.log(escrow)

return (<Row className="mt-4">
    <Col xs="2">
      <RoundedIcon icon={faQuestionCircle} bgColor="grey"/>
    </Col>
    <Col xs="10">
      <h5 className="m-0">Trade details</h5>
      <p className="text-dark m-0">{(escrow.tokenAmount * escrowAssetPrice).toFixed(2)} {escrow.offer.currency} for {escrow.tokenAmount} {escrow.token.symbol}</p>
      <p className="text-dark m-0">{escrow.token.symbol} Price = {escrowAssetPrice.toFixed(2)} {escrow.offer.currency}</p>
      {escrow.expirationTime && escrow.expirationTime !== '0' && <p className="text-dark m-0">Expiration time: {moment(escrow.expirationTime * 1000).calendar()}</p>}
      {escrow.status === tradeStates.waiting &&
       currentPriceForCurrency && diffPercentage > PERCENTAGE_THRESHOLD &&
       <Fragment>
        <p className="text-danger font-weight-bold mb-0">The current price for {escrow.token.symbol} is {currentPriceForCurrency} {escrow.offer.currency}, which is {diffPercentage.toFixed(2)}% {isAbove ? "above" : "below"} the price for this trade</p>
        <p className="text-danger mb-2">Double-check whether you really want to go through with this trade</p>
      </Fragment> }
      {escrow.offer.arbitrator === zeroAddress && <span className="text-danger">
        <FontAwesomeIcon className="mr-2" icon={faExclamationTriangle} size="sm"/>
        This Escrow does not have an arbitrator. Disputes cannot be opened
      </span>}
      </Col>
  </Row>);
};


EscrowDetail.propTypes = {
  escrow: PropTypes.object,
  currentPrice: PropTypes.object
};

export default EscrowDetail;
