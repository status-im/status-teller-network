import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";

import { PAYMENT_METHODS } from '../../../../features/metadata/constants';
import Address from "../../../../components/UserInformation/Address";
import {formatArbitratorName} from '../../../../utils/strings';
import {compactAddress} from "../../../../utils/address";

class SellSummary extends Component {
  state = {ready: false};

  formatRow(title, body) {
    return (<Fragment>
      <h3 className="font-weight-normal mt-3">{title}</h3>
      <p className="mt-1 mb-1">{body}</p>
    </Fragment>);
  }

  render() {
    const {profile, assetData, arbitratorProfile} = this.props;
    const {
      statusContactCode, username, location, margin, arbitrator,
      paymentMethods, currency, useCustomLimits, limitL, limitU
    } = this.props.seller;

    return (<Fragment>
      <h2>Offer summary</h2>

      {this.formatRow('Username', username === profile.username ? username : `${username} (used to be ${profile.username})`)}
      {this.formatRow('Contact code', statusContactCode === profile.statusContactCode ? <Address address={statusContactCode}/> : <Fragment><Address address={statusContactCode}/> (used to be <Address address={profile.statusContactCode}/>)</Fragment>)}
      {this.formatRow('Location', location === profile.location ? location : `${location} (used to be ${profile.location})`)}
      {this.formatRow('Asset', assetData.symbol)}
      {this.formatRow('Payment methods', paymentMethods.map(method => PAYMENT_METHODS[method]).join(', '))}
      {this.formatRow('Currency', currency)}
      {this.formatRow('Arbitrator', arbitratorProfile ? formatArbitratorName(arbitratorProfile, arbitrator, compactAddress(arbitrator, 3), 0) : <Address address={statusContactCode}/>)}
      {this.formatRow('Margin',  `${margin}%`)}
      {this.formatRow('Limits',  !useCustomLimits ? 'No limits' : `Between ${limitL} and ${limitU}`)}
    </Fragment>);
  }
}

SellSummary.propTypes = {
  seller: PropTypes.object,
  profile: PropTypes.object,
  arbitratorProfile: PropTypes.object,
  assetData: PropTypes.object
};

export default SellSummary;
