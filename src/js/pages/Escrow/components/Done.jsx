import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import Reputation from "../../../components/Reputation";
import {States} from '../../../utils/transaction';
import CheckIcon from "../../../../images/check.svg";

const Done = ({isDone, isBuyer, isActive, trade, rateStatus, rateTransaction}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" image={CheckIcon} bgColor="grey"/>}
      {isDone && <RoundedIcon size="xs" image={CheckIcon} bgColor="green"/>}
    </Col>

    <Col xs={isActive && isBuyer ? '6' : '11'} sm={isActive && isBuyer ? '8' : '11'}>
      <p className="m-0 font-weight-bold">
        Done
      </p>

      {!isDone && <p className="m-0 text-muted text-small">
        Trade is finished once every step above is complete
      </p>}

      {isDone && <p className="m-0 text-muted text-small">Trade is complete</p>}
    </Col>
    {isBuyer && isActive && <Col xs="5" sm="3">
      <div className="rounded p-2 position-relative shadow-sm bg-white">
        <p className="mb-1 text-small text-black">How did the trade go?</p>
        <p className="m-0 text-center">
          <Reputation trade={trade}
                      rateTransaction={(rateStatus !== States.pending && rateStatus !== States.success) ? rateTransaction : null}
                      size="l"/>
        </p>
      </div>
    </Col>}
  </Row>
);

Done.defaultProps = {
  isDone: false,
  isActive: false,
  isBuyer: false
};

Done.propTypes = {
  isDone: PropTypes.bool,
  isActive: PropTypes.bool,
  isBuyer: PropTypes.bool,
  trade: PropTypes.object,
  rateTransaction: PropTypes.func,
  rateStatus: PropTypes.string
};

export default Done;
