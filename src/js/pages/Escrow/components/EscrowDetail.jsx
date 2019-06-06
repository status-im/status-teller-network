import React, {Fragment} from 'react';
import {Row, Col} from 'reactstrap';
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import moment from "moment";

const PERCENTAGE_THRESHOLD = 10; // If asset price is 10% different than the real price, show the warning

const EscrowDetail = ({escrow, currentPrice}) => {
  const currentPriceForCurrency = parseFloat(currentPrice ? currentPrice[escrow.offer.currency] : null);
  const escrowAssetPrice = escrow.assetPrice / 100;
  return (<Row className="mt-4">
    <Col xs="2">
      <RoundedIcon icon={faQuestionCircle} bgColor="grey"/>
    </Col>
    <Col xs="10">
      <h5 className="m-0">Trade details</h5>
      <p className="text-dark m-0">{(escrow.tokenAmount * escrow.assetPrice / 100).toFixed(2)} {escrow.offer.currency} for {escrow.tokenAmount} {escrow.token.symbol}</p>
      <p className="text-dark m-0">{escrow.token.symbol} Price = {escrowAssetPrice} {escrow.offer.currency}</p>
      {escrow.expirationTime && escrow.expirationTime !== '0' && <p className="text-dark m-0">Expiration time: {moment(escrow.expirationTime * 1000).calendar()}</p>}
      {currentPriceForCurrency && escrowAssetPrice * ((PERCENTAGE_THRESHOLD + 100) / 100) < currentPriceForCurrency &&
      <Fragment>
        <p className="text-danger font-weight-bold mb-0">The current price for {escrow.token.symbol} is {currentPriceForCurrency} {escrow.offer.currency}, which is {PERCENTAGE_THRESHOLD}% above the price for this trade</p>
        <p className="text-danger mb-1">Double-check whether you really want to go through with this trade</p>
      </Fragment>}
      </Col>
  </Row>);
};


EscrowDetail.propTypes = {
  escrow: PropTypes.object,
  currentPrice: PropTypes.object
};

export default EscrowDetail;
