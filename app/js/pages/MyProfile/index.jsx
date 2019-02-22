import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import metadata from '../../features/metadata';
import network from '../../features/network';

import UserInformation from '../../components/UserInformation';
import Trades from './components/Trades';
import Offers from './components/Offers';
import StatusContactCode from './components/StatusContactCode';
import { zeroAddress } from '../../utils/address';

const NULL_PROFILE = {
  address: zeroAddress,
  username: '',
  trades: [],
  reputation: {upCount: 0, downCount: 0},
  offers: []
};

class MyProfile extends Component {
  componentDidMount() {
    this.props.loadProfile(this.props.address);
  }

  render() {
    const profile = this.props.profile;
    return (
      <Fragment>
        <UserInformation reputation={profile.reputation} address={profile.address} username={profile.username}/>
        <Trades trades={profile.trades}/>
        <Offers offers={profile.offers} location={profile.location} />
        {profile.username.length > 0 && <StatusContactCode value={profile.statusContactCode} />}
      </Fragment>
    );
  }
}

MyProfile.propTypes = {
  address: PropTypes.string,
  profile: PropTypes.object,
  loadProfile: PropTypes.func
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    profile: metadata.selectors.getProfile(state, address) || NULL_PROFILE
  };
};


export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load
  })(MyProfile);
