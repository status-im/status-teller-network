import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import metadata from '../features/metadata';
import network from '../features/network';

import SellerInformation from '../components/SellerInformation';
import Trades from '../components/Profile/Trades';
import Offers from '../components/Profile/Offers';
import StatusContactCode from '../components/StatusContactCode';

class ProfileContainer extends Component {
  componentDidMount() {
    this.props.loadProfile(this.props.address);
  }

  render() {
    const profile = this.props.profile;
    return (
      <Fragment>
        <SellerInformation reputation={profile.reputation} address={profile.address} name={profile.username}/>
        <Trades trades={profile.trades}/>
        <Offers offers={profile.offers} location={profile.location} />
        <StatusContactCode value={profile.statusContactCode} toggleQRCode={this.props.toggleQRCode} showQRCode={this.props.showQRCode} />
      </Fragment>
    );
  }
}

ProfileContainer.propTypes = {
  address: PropTypes.string,
  profile: PropTypes.object,
  loadProfile: PropTypes.func,
  toggleQRCode: PropTypes.func,
  showQRCode: PropTypes.bool
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    profile: metadata.selectors.getProfile(state, address),
    showQRCode: metadata.selectors.showQRCode(state)
  };
};


export default connect(
  mapStateToProps,
  {
    toggleQRCode: metadata.actions.toggleQRCode,
    loadProfile: metadata.actions.load
  })(ProfileContainer);
