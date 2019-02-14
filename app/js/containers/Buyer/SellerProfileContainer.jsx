import React, { Component } from 'react';
import SellerInformation from '../../components/SellerInformation';
import SellerOfferList from '../../components/Buyer/SellerOfferList';
import Map from '../../components/Buyer/Map';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import buyer from "../../features/buyer";
import {withRouter} from "react-router-dom";

import ETH from "../../../images/ethereum.png";
import SNT from "../../../images/status.png";
import ZRX from "../../../images/ZRX.png";

import './SellerProfileContainer.scss';

const FAKE_OFFERS = [
  {asset: {name: 'SNT', icon: ETH}, min: 200, max: 600, fiat: '$'},
  {asset: {name: 'ETH', icon: SNT}, min: 200, max: 600, fiat: '$'},
  {asset: {name: 'ZRX', icon: ZRX}, min: 200, max: 600, fiat: '$'}
];

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.address = this.props.match.params.address;
    // TODO get seller information
  }

  offerClick = (offerId) => {
    this.props.setOffer(offerId);
    this.props.history.push('/buy/contact');
  };

  render() {
    return (
      <div className="seller-profile-container">
        <SellerInformation name="Roger" reputation={{upCount: 442, downCount: 32}} address={this.address} />
        <h3 className="mt-3">Location</h3>
        <Map coords={{latitude: 45.492611, longitude: -73.617959}} markerOnly={true}/>
        <p className="text-muted mt-2">Saalestraße 39A, 12055 Berlin</p>
        <SellerOfferList offers={FAKE_OFFERS} onClick={this.offerClick}/>
      </div>
    );
  }
}

ProfileContainer.propTypes = {
  match: PropTypes.object,
  setOffer: PropTypes.func,
  history: PropTypes.object
};

export default connect(
  null,
  {
    setOffer: buyer.actions.setOffer
  }
)(withRouter(ProfileContainer));
