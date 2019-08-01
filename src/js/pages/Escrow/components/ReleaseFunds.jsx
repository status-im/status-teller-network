import React, {Fragment} from 'react';
import {Row, Col, Button} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import {faUserCheck, faCheck} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';

// eslint-disable-next-line complexity
const ReleaseFunds = ({isBuyer, isActive, isDone, action, isPaid}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" icon={faUserCheck} bgColor={isActive ? "primary" : "grey"}/>}
      {isDone && <RoundedIcon size="xs" icon={faCheck} bgColor="green"/>}
    </Col>

    <Col xs={isActive ? '7' : '9'} sm={isActive ? '8' : '9'} md={isActive ? '9' : '9'}>
      <p className={classnames("m-0 font-weight-bold", {'text-primary': isActive, 'text-black': !isActive})}>
        Confirm payment & Release funds
      </p>

      {!isDone && <Fragment>
        <p className="m-0 text-muted text-small">
          {isBuyer && 'Seller will release funds from the escrow to your wallet'}
          {!isBuyer && isPaid && 'Payment done by the buyer. Check that you received it and release the funds'}
          {!isBuyer && !isPaid && 'Wait for the buyer to send you the money, then you can release'}
        </p>
      </Fragment>}

      {isDone && <p className="m-0 text-muted text-small">Payment has been confirmed and money released.</p>}
    </Col>

    <Col xs={isActive ? '4' : '2'} sm={isActive ? '3' : '2'} md={isActive ? '2' : '2'}>
      {!isDone && !isActive && <p className="text-muted text-small">{isBuyer ? 'Seller' : 'You'}</p>}

      {isActive && isBuyer && <div className="bg-dark rounded p-2 position-relative">
        <span className="bubble-triangle bg-dark"/>
        <p className="text-white text-small font-weight-bold m-0">Seller&apos;s turn</p>
        <p className="text-white text-mini m-0">No action needed</p>
      </div>}

      {isActive && !isBuyer && <div className="bg-primary rounded p-2 position-relative">
        <span className="bubble-triangle bg-primary"/>
        <p className="text-white mb-1 text-small">It&apos;s your turn</p>
        <p className="m-0 text-center">
          <Button id="fund-escrow-btn" onClick={action} className="p-2 text-primary text-small rounded">
            Release funds →
          </Button>
        </p>
      </div>}
    </Col>
  </Row>
);

ReleaseFunds.defaultProps = {
  isBuyer: false,
  isActive: false,
  isDone: false,
  isPaid: false
};

ReleaseFunds.propTypes = {
  isBuyer: PropTypes.bool,
  isActive: PropTypes.bool,
  isDone: PropTypes.bool,
  isPaid: PropTypes.bool,
  action: PropTypes.func
};

export default ReleaseFunds;
