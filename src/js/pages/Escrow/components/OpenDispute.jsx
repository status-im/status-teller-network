import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import exclamationCircle from "../../../../images/exclamation-circle.png";
import RoundedIcon from "../../../ui/RoundedIcon";
import escrow from '../../../features/escrow';
import {Link} from "react-router-dom";
import {zeroAddress} from '../../../utils/address';

const OpenDispute = ({trade}) => {
  const shouldDisplay = trade.status === escrow.helpers.tradeStates.paid && trade.arbitrator !== zeroAddress;
  return shouldDisplay && (
    <Row className="mt-4 text-danger" tag={Link} to={"/openCase/" + trade.escrowId}>
      <Col xs="2">
        <RoundedIcon image={exclamationCircle} bgColor="red"/>
      </Col>
      <Col xs="10" className="my-auto">
        <p className="m-0 font-weight-normal">Open dispute</p>
        <p className="m-0 text-muted">Having problems?</p>
      </Col>
    </Row>
  );
};

OpenDispute.propTypes = {
  trade: PropTypes.object
};

export default OpenDispute;
