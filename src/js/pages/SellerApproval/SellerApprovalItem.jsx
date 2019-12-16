import React, {Fragment} from "react";
import PropTypes from 'prop-types';
import {Button} from "reactstrap";
import classnames from "classnames";

import arbitration from "../../features/arbitration";
import UserInfoRow from "../../components/UserInfoRow";
import {withTranslation} from "react-i18next";

const SellerApprovalItem = ({t, address, status, user = {}, acceptRequest, rejectRequest, blacklist, unBlacklist}) => {
  const requestStatus = {
    [arbitration.constants.AWAIT]: t('sellerApproval.pending'),
    [arbitration.constants.ACCEPTED]: t('sellerApproval.accepted'),
    [arbitration.constants.REJECTED]: t('sellerApproval.rejected')
  };
  const BLACKLISTED_STATUS = t('sellerApproval.blacklisted');

  return <UserInfoRow address={address} user={user} lastCol={<Fragment>
    {status === arbitration.constants.AWAIT && !blacklist &&
    <Button color="link" onClick={acceptRequest} className="m-0 p-0">{t('sellerApproval.accept')}</Button>}
    {(status === arbitration.constants.AWAIT || status === arbitration.constants.ACCEPTED) && !blacklist &&
    <Button color="link" onClick={rejectRequest} className="m-0 p-0 text-danger">{t('sellerApproval.reject')}</Button>}

    {blacklist && status !== BLACKLISTED_STATUS &&
    <Button color="link" onClick={blacklist} className="m-0 p-0 text-danger">{t('sellerApproval.blacklist')}</Button>}
    {unBlacklist && status === BLACKLISTED_STATUS &&
    <Button color="link" onClick={unBlacklist} className="m-0 p-0 text-black">{t('sellerApproval.unblacklist')}</Button>}

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
  t: PropTypes.func,
  address: PropTypes.string,
  status: PropTypes.string,
  user: PropTypes.object,
  acceptRequest: PropTypes.func,
  rejectRequest: PropTypes.func,
  blacklist: PropTypes.func,
  unBlacklist: PropTypes.func
};

export default withTranslation()(SellerApprovalItem);
