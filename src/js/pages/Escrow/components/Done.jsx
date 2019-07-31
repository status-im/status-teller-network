import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import {faCheck} from "@fortawesome/free-solid-svg-icons";

const Done = ({isDone}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" icon={faCheck} bgColor="primary"/>}
      {isDone && <RoundedIcon size="xs" icon={faCheck} bgColor="green"/>}
    </Col>

    <Col xs="11">
      <p className="m-0 font-weight-bold">
        Done
      </p>

      {!isDone && <p className="m-0 text-muted text-small">
        Trade is finished once every step above is complete
      </p>}

      {isDone && <p className="m-0 text-muted text-small">Trade is complete</p>}
    </Col>
  </Row>
);

Done.defaultProps = {
  isDone: false
};

Done.propTypes = {
  isDone: PropTypes.bool
};

export default Done;
