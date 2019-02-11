import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import metadata from '../features/metadata';
import embarkjs from '../features/embarkjs';

import ProfileInformation from '../components/ProfileInformation';
import Reputation from '../components/Reputation';
import Trades from '../components/Trades';
import Offers from '../components/Offers';
import StatusContractCode from '../components/StatusContractCode';

class ProfileContainer extends Component {
  componentDidMount() {
    this.props.loadProfile(this.props.address);
  }

  render() {
    const profile = this.props.profile;
    return (
      <Fragment>
        <ProfileInformation address={profile.address} username={profile.username} />
        <Reputation reputation={profile.reputation}/>
        <Trades trades={profile.trades}/>
        <Offers offers={profile.offers} />
        <StatusContractCode value={profile.statusContractCode} />
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
  const address = embarkjs.selectors.getAddress(state) || '';
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
