import React, {Fragment} from 'react';
import {Row, Col, Button} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import {faHandHoldingUsd, faCheck} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';
import ArrowDown from "../../../../images/down-arrow.svg";

const SendMoney = ({isBuyer, isActive, isDone, action, fiatAmount, fiatSymbol}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" icon={faHandHoldingUsd} bgColor={isActive ? "primary" : "grey"}/>}
      {isDone && <RoundedIcon size="xs" icon={faCheck} bgColor="green"/>}
      {!isDone && isActive && <img src={ArrowDown} alt="" className="arrow" />}
    </Col>

    <Col xs={isActive ? '7' : '9'} sm={isActive ? '8' : '9'} md={isActive ? '9' : '9'}>
      <p className={classnames("m-0 font-weight-bold", {'text-primary': isActive, 'text-black': !isActive})}>
        Transfer money
      </p>

      {!isDone && <Fragment>
        <p className="m-0 text-muted text-small">
          {isBuyer && <Fragment>
            Please send <span className="font-weight-bold">{fiatAmount} {fiatSymbol}</span> to the seller through the decided payment method
          </Fragment>}
          {!isBuyer && 'Buyer will send money to you'}
        </p>
      </Fragment>}

      {isDone && <p className="m-0 text-muted text-small">Money transferred</p>}
    </Col>

    <Col xs={isActive ? '4' : '2'} sm={isActive ? '3' : '2'} md={isActive ? '2' : '2'}>
      {!isDone && !isActive && <p className="text-muted text-small">{isBuyer ? 'You' : 'Buyer'}</p>}

      {isActive && !isBuyer && <div className="bg-dark rounded p-2 position-relative">
        <span className="bubble-triangle bg-dark"/>
        <p className="text-white text-small font-weight-bold m-0">Buyer&apos;s turn</p>
        <p className="text-white text-mini m-0">No action needed</p>
      </div>}

      {isActive && isBuyer && <div className="bg-primary rounded p-2 position-relative">
        <span className="bubble-triangle bg-primary"/>
        <p className="text-white mb-1 text-small">It&apos;s your turn</p>
        <p className="m-0 text-center">
          <Button id="fund-escrow-btn" onClick={action} className="p-2 text-primary text-small rounded">
            Mark as paid →
          </Button>
        </p>
      </div>}
    </Col>
  </Row>
);

SendMoney.defaultProps = {
  isBuyer: false,
  isActive: false,
  isDone: false
};

SendMoney.propTypes = {
  isBuyer: PropTypes.bool,
  isActive: PropTypes.bool,
  isDone: PropTypes.bool,
  action: PropTypes.func,
  fiatAmount: PropTypes.string,
  fiatSymbol: PropTypes.string
};

export default SendMoney;
