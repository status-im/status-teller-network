/* eslint-disable no-alert,no-restricted-globals */
import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import {faTimes} from "@fortawesome/free-solid-svg-icons";

import RoundedIcon from "../../../ui/RoundedIcon";
import escrow from '../../../features/escrow';


const CancelEscrow = ({cancelEscrow, trade}) => {
  const shouldDisplay = trade.status === escrow.helpers.tradeStates.waiting || trade.status === escrow.helpers.tradeStates.funded;
  return shouldDisplay && <a onClick={() => { if(confirm('Sure?')) cancelEscrow(trade.escrowId); }}>
    <Row className="mt-4 text-primary">
      <Col xs="2">
        <RoundedIcon icon={faTimes} bgColor="blue"/>
      </Col>
      <Col xs="10" className="my-auto">
        <h6 className="m-0">Cancel Trade</h6>
      </Col>
    </Row>
  </a>;
};

CancelEscrow.propTypes = {
  cancelEscrow: PropTypes.func,
  trade: PropTypes.object
};

export default CancelEscrow;
