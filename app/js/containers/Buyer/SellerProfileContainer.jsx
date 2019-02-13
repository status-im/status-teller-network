import React, { Component } from 'react';
import SellerInformation from '../../components/SellerInformation';
import SellerOfferList from '../../components/Buyer/SellerOfferList';
import Map from '../../components/Buyer/Map';
import statusContactCode from '../../components/statusContactCode';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import buyer from "../../features/buyer";
import {withRouter} from "react-router-dom";

import './SellerProfileContainer.scss';

const FAKE_OFFERS = [
  {asset: 'ETH', min: 200, max: 600, fiat: '$'},
  {asset: 'SNT', min: 200, max: 600, fiat: '$'},
  {asset: 'DAI', min: 200, max: 600, fiat: '$'}
];

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.address = this.props.match.params.address;
    // TODO get seller information
  }

  offerClick = (offerId) => {
    console.log('Gogogo', offerId);
    this.props.setOffer(offerId);
    this.props.history.push('/buy/contact');
  };

  render() {
    return (
      <div className="seller-profile-container">
        <SellerInformation name="Roger" isPositiveRating={true} nbTrades={32} type="Collectibles" address={this.address} />
        <Map coords={{latitude: 45.492611, longitude: -73.617959}} markerOnly={true}/>
        <p className="text-muted mt-2 mb-0">Saalestraße 39A,</p>
        <p className="text-muted">12055 Berlin</p>
        <SellerOfferList offers={FAKE_OFFERS} onClick={this.offerClick}/>
        <statusContactCode />
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
