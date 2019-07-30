import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import FundIcon from "../../../../images/fund.png";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';

const FundingEscrow = ({isBuyer, isActive, isDone}) => (
  <Row className="mt-4">
    <Col xs="2">
      {!isDone && <RoundedIcon size="xs" image={FundIcon} bgColor="blue"/>}
      {isDone && <RoundedIcon size="xs" image={faCheck} bgColor="green"/>}
    </Col>
    <Col xs="10 my-auto">
      <p className={classnames("m-0 font-weight-bold", {'text-primary' : isActive, 'text-black' : !isActive})}>Funding an escrow</p>
      <p className="m-0 text-muted text-small">{isBuyer ? 'Waiting for the seller to fund an escrow' : 'You need to fund an escrow. The buyer is waiting for you'}</p>
    </Col>
  </Row>
);

FundingEscrow.defaultProps = {
  isBuyer: false,
  isActive: false,
  isDone: false
};

FundingEscrow.propTypes = {
  isBuyer: PropTypes.bool,
  isActive: PropTypes.bool,
  isDone: PropTypes.bool
};

export default FundingEscrow;
