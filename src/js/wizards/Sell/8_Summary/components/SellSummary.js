import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {Row, Col} from "reactstrap";

import { PAYMENT_METHODS } from '../../../../features/metadata/constants';
import Identicon from "../../../../components/UserInformation/Identicon";
import {compactAddress} from "../../../../utils/address";
import {getTokenImage} from "../../../../utils/images";

import './SellSummary.scss';

class SellSummary extends Component {
  state = {ready: false};

  formatRow(title, body) {
    return (<Fragment>
      <h3 className="font-weight-normal mt-4 mb-0 line-title">{title}</h3>
      <div className="mt-1 mb-1 line-text">{body}</div>
    </Fragment>);
  }

  render() {
    const {profile, assetData, arbitratorProfile, prices} = this.props;
    const {
      location, margin, arbitrator,
      paymentMethods, currency, useCustomLimits, limitL, limitU
    } = this.props.seller;

    let calcPrice = null;
    if (prices && !prices.error) {
      const basePrice = prices[assetData.symbol][currency];
      const marginPrice = (margin || 0) / 100 * basePrice;
      calcPrice = basePrice + marginPrice;
    }

    return (<div className="offer-summary">
      <h2>Offer summary</h2>
      {this.formatRow('Asset', <Fragment>
        <img src={getTokenImage(assetData.symbol)} alt={assetData.name + ' icon'}
             className="asset-image mr-2 float-left token-img"/>
        <span className="line-text-asset">
          {assetData.name} <span className="text-muted font-weight-normal">{assetData.symbol}</span>
        </span>
      </Fragment>)}

      {calcPrice !== null && this.formatRow('Selling price',  `1 ${assetData.symbol} = ${calcPrice.toFixed(2)} ${currency} (${Math.abs(margin)}% ${margin >= 0 ? 'above' : 'below'})`)}
      {calcPrice === null && this.formatRow('Margin',  `${Math.abs(margin)}% ${margin >= 0 ? 'above' : 'below'}`)}


      {this.formatRow('Limits',  !useCustomLimits ? 'No limits' : `Between ${limitL} and ${limitU} ${currency}`)}

      {this.formatRow('Payment methods', paymentMethods.map(method => PAYMENT_METHODS[method]).join(', '))}

      {this.formatRow('Location', !profile || location === profile.location ? location : `${location} (used to be ${profile.location})`)}

      {this.formatRow('Arbitrator', <Row>
        <Col xs={1}>
          <Identicon seed={arbitrator} className="rounded-circle border mt-1"/>
        </Col>
        <Col xs={11}className="pl-3">
          <p className="m-0">{arbitratorProfile && arbitratorProfile.username ? arbitratorProfile.username : 'No Username'}</p>
          <p className="m-0 text-muted text-small">{compactAddress(arbitrator, 5)}</p>
        </Col>
      </Row>)}
    </div>);
  }
}

SellSummary.propTypes = {
  seller: PropTypes.object,
  profile: PropTypes.object,
  prices: PropTypes.object,
  arbitratorProfile: PropTypes.object,
  assetData: PropTypes.object
};

export default SellSummary;
