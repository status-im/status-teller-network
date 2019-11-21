import React, {Fragment} from "react";
import PropTypes from 'prop-types';
import {Button, Col, Row} from "reactstrap";
import classnames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsUp, faThumbsDown} from "@fortawesome/free-solid-svg-icons";

import arbitration from "../../features/arbitration";
import Identicon from "../../components/UserInformation/Identicon";
import Address from "../../components/UserInformation/Address";

const requestStatus = {
  [arbitration.constants.AWAIT]: "Pending",
  [arbitration.constants.ACCEPTED]: "Accepted",
  [arbitration.constants.REJECTED]: "Rejected"
};
const BLACKLISTED_STATUS = 'Blacklisted';

const SellerApprovalItem = ({address, status, user = {}, acceptRequest, rejectRequest, blacklist, unBlacklist}) => {
  return <Row>
    <Col xs={2}>
      <div className="rounded-icon rounded-circle rounded-icon__blue">
        <Identicon seed={user.statusContactCode} className="rounded-circle border" scale={5}/>
      </div>
    </Col>
    <Col xs={7}>
      <h6 className="m-0">{user.username}</h6>
      <p className="text-muted m-0 text-small"><Address address={address} length={5}/></p>
      <p className="m-0 text-small font-weight-medium">
        {user.nbReleasedTrades} <span className="text-muted font-weight-normal">trades</span>
        <FontAwesomeIcon icon={faThumbsUp} className="text-muted font-weight-normal ml-2"/> {user.upCount}
        <FontAwesomeIcon icon={faThumbsDown} className="text-muted font-weight-normal ml-2"/> {user.downCount}
      </p>
    </Col>
    <Col xs={3} className="text-center">
      {status === arbitration.constants.AWAIT && !blacklist &&
      <Button color="link" onClick={acceptRequest} className="m-0 p-0">Accept</Button>}
      {(status === arbitration.constants.AWAIT || status === arbitration.constants.ACCEPTED) && !blacklist &&
      <Button color="link" onClick={rejectRequest} className="m-0 p-0 text-danger">Reject</Button>}

      {blacklist && status !== BLACKLISTED_STATUS &&
      <Button color="link" onClick={blacklist} className="m-0 p-0 text-danger">Blacklist</Button>}
      {unBlacklist && status === BLACKLISTED_STATUS &&
      <Button color="link" onClick={unBlacklist} className="m-0 p-0 text-black">Un-Blacklist</Button>}

      <p className={classnames('text-small', {
        'text-success': status === arbitration.constants.ACCEPTED,
        'text-danger': status === arbitration.constants.REJECTED || status === BLACKLISTED_STATUS,
        'text-muted': status === arbitration.constants.AWAIT
      })}>
        {status && <Fragment>({requestStatus[status] || status})</Fragment>}
      </p>
    </Col>
  </Row>;
};

SellerApprovalItem.propTypes = {
  address: PropTypes.string,
  status: PropTypes.string,
  user: PropTypes.object,
  acceptRequest: PropTypes.func,
  rejectRequest: PropTypes.func,
  blacklist: PropTypes.func,
  unBlacklist: PropTypes.func
};

export default SellerApprovalItem;
