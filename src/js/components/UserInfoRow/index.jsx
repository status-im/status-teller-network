import React, {Fragment} from "react";
import PropTypes from 'prop-types';
import {Col, Row} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsUp, faThumbsDown} from "@fortawesome/free-solid-svg-icons";

import Identicon from "../../components/UserInformation/Identicon";
import Address from "../../components/UserInformation/Address";

const UserInfoRow = ({address, user = {}, lastCol, hideAddress, lastColSize}) => {
  return <Row>
    <Col xs={2}>
      <div className="rounded-icon rounded-circle rounded-icon__blue">
        <Identicon seed={user.statusContactCode} className="rounded-circle border" scale={5}/>
      </div>
    </Col>
    <Col xs={12 - (lastColSize + 2)}>
      <h6 className="m-0">{user.username}</h6>
      {!hideAddress && <p className="text-muted m-0 text-small"><Address address={address} length={5}/></p>}
      <p className="m-0 text-small font-weight-medium">
        {!isNaN(user.nbReleasedTrades) && <Fragment>
          {user.nbReleasedTrades} <span className="text-muted font-weight-normal">trade{user.nbReleasedTrades > 1 && 's'}</span>
        </Fragment>}
        {!isNaN(user.upCount) && <Fragment>
          <FontAwesomeIcon icon={faThumbsUp} className="text-muted font-weight-normal ml-2"/> {user.upCount}
        </Fragment>}
        {!isNaN(user.upCount) && <Fragment>
          <FontAwesomeIcon icon={faThumbsDown} className="text-muted font-weight-normal ml-2"/> {user.downCount}
        </Fragment>}
      </p>
    </Col>
    <Col xs={lastColSize} className="text-center">
      {lastCol}
    </Col>
  </Row>;
};

UserInfoRow.defaultProps = {
  lastColSize: 3
};

UserInfoRow.propTypes = {
  address: PropTypes.string,
  lastColSize: PropTypes.number,
  user: PropTypes.object,
  lastCol: PropTypes.node,
  hideAddress: PropTypes.bool
};

export default UserInfoRow;
