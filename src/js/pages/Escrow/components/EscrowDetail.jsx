import React from 'react';
import {Row, Col} from 'reactstrap';
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import moment from "moment";

const EscrowDetail = ({escrow}) => <Row className="mt-4">
    <Col xs="2">
      <RoundedIcon icon={faQuestionCircle} bgColor="grey"/>
    </Col>
    <Col xs="10">
      <h5 className="m-0">Trade details</h5>
      <p className="text-dark m-0">{(escrow.tokenAmount * escrow.assetPrice / 100).toFixed(2)} {escrow.offer.currency} for {escrow.tokenAmount} {escrow.token.symbol}</p>
      <p className="text-dark m-0">{escrow.token.symbol} Price = {escrow.assetPrice / 100} {escrow.offer.currency}</p>
      {escrow.expirationTime && escrow.expirationTime !== '0' && <p className="text-dark m-0">Expiration time: {moment(escrow.expirationTime * 1000).calendar()}</p>}
    </Col>
  </Row>;


EscrowDetail.propTypes = {
  escrow: PropTypes.object
};

export default EscrowDetail;
