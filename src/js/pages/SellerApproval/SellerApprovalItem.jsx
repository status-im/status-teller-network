import React, {Fragment} from "react";
import PropTypes from 'prop-types';
import {Button} from "reactstrap";
import classnames from "classnames";

import arbitration from "../../features/arbitration";
import UserInfoRow from "../../components/UserInfoRow";

const requestStatus = {
  [arbitration.constants.AWAIT]: "Pending",
  [arbitration.constants.ACCEPTED]: "Accepted",
  [arbitration.constants.REJECTED]: "Rejected"
};
const BLACKLISTED_STATUS = 'Blacklisted';

const SellerApprovalItem = ({address, status, user = {}, acceptRequest, rejectRequest, blacklist, unBlacklist}) => {
  return <UserInfoRow address={address} user={user} lastCol={<Fragment>
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
  </Fragment>}/>;
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
