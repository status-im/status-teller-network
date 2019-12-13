import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import exclamationCircle from "../../../../images/exclamation-circle.png";
import RoundedIcon from "../../../ui/RoundedIcon";
import escrow from '../../../features/escrow';
import {Link} from "react-router-dom";
import {zeroAddress} from '../../../utils/address';
import {withTranslation} from "react-i18next";

const OpenDispute = ({t, trade}) => {
  const shouldDisplay = trade.status === escrow.helpers.tradeStates.paid && trade.arbitrator !== zeroAddress;
  return shouldDisplay && (
    <Row className="mt-4 text-danger" tag={Link} to={"/openCase/" + trade.escrowId}>
      <Col xs="2">
        <RoundedIcon image={exclamationCircle} bgColor="red"/>
      </Col>
      <Col xs="10" className="my-auto">
        <p className="m-0 font-weight-normal">{t('escrow.openDispute.open')}</p>
        <p className="m-0 text-muted">{t('escrow.openDispute.havingProblem')}</p>
      </Col>
    </Row>
  );
};

OpenDispute.propTypes = {
  t: PropTypes.func,
  trade: PropTypes.object
};

export default withTranslation()(OpenDispute);
