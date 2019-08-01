import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import Reputation from "../../../components/Reputation";
import { States } from '../../../utils/transaction';
import classnames from 'classnames';

const Done = ({isDone, isBuyer, isActive, trade, rateStatus, rateTransaction}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" icon={faCheck} bgColor="grey"/>}
      {isDone && <RoundedIcon size="xs" icon={faCheck} bgColor="green"/>}
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
      <div className={classnames("rounded p-2 position-relative", {'bg-primary': (rateStatus !== States.pending && rateStatus !== States.success),
        'bg-dark': !(rateStatus !== States.pending && rateStatus !== States.success)})}>
        <span className={classnames("bubble-triangle", {'bg-primary': (rateStatus !== States.pending && rateStatus !== States.success),
          'bg-dark': !(rateStatus !== States.pending && rateStatus !== States.success)})}/>
        <p className="text-white mb-1 text-small">How did the trade go?</p>
        <p className="m-0 text-center">
          <Reputation trade={trade} rateTransaction={(rateStatus !== States.pending && rateStatus !== States.success) ? rateTransaction : null} size="l"/>
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
