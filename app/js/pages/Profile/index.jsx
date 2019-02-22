import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import SellerInformation from '../../components/SellerInformation';
import SellerOfferList from '../OffersList/components/SellerOfferList';
import Map from '../../components/ui/Map';
import buyer from "../../features/buyer";
import metadata from "../../features/metadata";

import './SellerProfileContainer.scss';

class SellerProfileContainer extends Component {
  componentDidMount() {
    this.props.load(this.props.match.params.address);
  }

  offerClick = (offerId) => {
    this.props.setOffer(offerId);
    this.props.history.push('/buy/offer/');
  };

  render() {
    const profile = this.props.profile;
    return (
      <div className="seller-profile-container">
        <SellerInformation username={profile.username} reputation={profile.reputation} address={profile.address} />
        <h3 className="mt-3">{profile.location}</h3>
        <Map coords={{latitude: 45.492611, longitude: -73.617959}} markerOnly={true}/>
        <p className="text-muted mt-2">Saalestraße 39A, 12055 Berlin</p>
        <SellerOfferList offers={profile.offers} onClick={this.offerClick}/>
      </div>
    );
  }
}

SellerProfileContainer.propTypes = {
  match: PropTypes.object,
  setOffer: PropTypes.func,
  load: PropTypes.func,
  history: PropTypes.object,
  profile: PropTypes.object
};

const mapStateToProps = (state, props) => {
  const address = props.match.params.address;
  return {
    profile: metadata.selectors.getProfile(state, address)
  };
};

export default connect(
  mapStateToProps,
  {
    load: metadata.actions.load,
    setOffer: buyer.actions.setOffer
  }
)(withRouter(SellerProfileContainer));
