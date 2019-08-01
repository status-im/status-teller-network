import React, {Fragment} from 'react';
import {Row, Col, Button, UncontrolledTooltip} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import FundIcon from "../../../../images/fund.png";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';
import {States} from "../../../utils/transaction";
import ArrowDown from "../../../../images/down-arrow.svg";

// eslint-disable-next-line complexity
const FundingEscrow = ({isBuyer, isActive, isDone, needsApproval, action, tokenAmount, tokenSymbol, feePercent, feeAmount, enoughBalance}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" image={FundIcon} bgColor="primary"/>}
      {isDone && <RoundedIcon size="xs" icon={faCheck} bgColor="green"/>}
      {!isDone && <img src={ArrowDown} alt="" className="arrow" />}
    </Col>

    <Col xs={isActive ? '7' : '9'} sm={isActive ? '8' : '9'} md={isActive ? '9' : '9'}>
      <p className={classnames("m-0 font-weight-bold", {'text-primary': isActive, 'text-black': !isActive})}>
        Funding an escrow
      </p>

      {!isDone && <Fragment>
        <p className="m-0 text-muted text-small">
          {isBuyer ? 'Waiting for the seller to fund an escrow' : 'You need to fund an escrow. The buyer is waiting for you'}
        </p>
        {!isBuyer && <Fragment>
          <p className="m-0 text-muted text-small">
            Funding {tokenAmount} {tokenSymbol} + our fee of {feePercent} % ({feeAmount} {tokenSymbol})
          </p>
          {!enoughBalance && <p className="m-0 text-small text-danger">Not enough balance</p>}
        </Fragment>}
      </Fragment>}

      {isDone && <p className="m-0 text-muted text-small">Tokens funded in the escrow</p>}
    </Col>

    <Col xs={isActive ? '4' : '2'} sm={isActive ? '3' : '2'} md={isActive ? '2' : '2'}>

      {isActive && isBuyer && <div className="bg-dark rounded p-2 position-relative">
        <span className="bubble-triangle bg-dark"/>
        <p className="text-white text-small font-weight-bold m-0">Seller&apos;s turn</p>
        <p className="text-white text-mini m-0">No action needed</p>
      </div>}

      {isActive && !isBuyer && <div className="bg-primary rounded p-2 position-relative">
        <span className="bubble-triangle bg-primary"/>
        <p className="text-white mb-1 text-small">It&apos;s your turn</p>
        <p className="m-0 text-center">
          <Button id="fund-escrow-btn" onClick={action} className="p-2 text-primary text-small rounded"
                  disabled={!enoughBalance}>
            {needsApproval ? 'Approve transfer' : 'Fund escrow →'}
          </Button>
          {needsApproval && <UncontrolledTooltip placement="left" target="fund-escrow-btn">
            You need to approve the transfer of tokens first to allow our contract to transfer the tokens on your
            behalf.
            Do not worry, the approval is only for the amount in this escrow.
          </UncontrolledTooltip>}
        </p>
      </div>}
    </Col>
  </Row>
);

FundingEscrow.defaultProps = {
  isBuyer: false,
  isActive: false,
  isDone: false,
  needsApproval: false,
  enoughBalance: true
};

FundingEscrow.propTypes = {
  isBuyer: PropTypes.bool,
  isActive: PropTypes.bool,
  needsApproval: PropTypes.bool,
  isDone: PropTypes.bool,
  enoughBalance: PropTypes.bool,
  action: PropTypes.func,
  tokenAmount: PropTypes.string,
  tokenSymbol: PropTypes.string,
  feePercent: PropTypes.string,
  feeAmount: PropTypes.string
};

export default FundingEscrow;
