import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';

import exclamationCircle from "../../../../images/exclamation-circle.png";
import RoundedIcon from "../../../ui/RoundedIcon";
import escrow from '../../../features/escrow';

const OpenDispute = ({trade}) => {
  const shouldDisplay = trade.status !== escrow.helpers.tradeStates.waiting && trade.status !== escrow.helpers.tradeStates.funded;
  return shouldDisplay && <Row className="mt-4 text-danger">
    <Col xs="2">
      <RoundedIcon image={exclamationCircle} bgColor="red"/>
    </Col>
    <Col xs="10" className="my-auto">
      <h6 className="m-0">Open dispute</h6>
    </Col>
  </Row>;
};

OpenDispute.propTypes = {
  trade: PropTypes.object
};

export default OpenDispute;
