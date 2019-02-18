import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import metadata from '../features/metadata';
import network from '../features/network';

import SellerInformation from '../components/SellerInformation';
import Trades from '../components/Trades';
import Offers from '../components/Offers';
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
        <StatusContactCode value={profile.statusContactCode} />
      </Fragment>
    );
  }
}

ProfileContainer.propTypes = {
  address: PropTypes.string,
  profile: PropTypes.object,
  loadProfile: PropTypes.func
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    profile: metadata.selectors.getProfile(state, address)
  };
};


export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load
  })(ProfileContainer);
