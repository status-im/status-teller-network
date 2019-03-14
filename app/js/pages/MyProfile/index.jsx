import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import metadata from '../../features/metadata';
import network from '../../features/network';
import escrow from '../../features/escrow';
import arbitration from '../../features/arbitration';

import UserInformation from '../../components/UserInformation';
import Trades from './components/Trades';
import Offers from './components/Offers';
import Disputes from './components/Disputes';
import StatusContactCode from './components/StatusContactCode';
import { zeroAddress } from '../../utils/address';

const NULL_PROFILE = {
  address: zeroAddress,
  username: '',
  reputation: {upCount: 0, downCount: 0},
  offers: []
};

class MyProfile extends Component {
  componentDidMount() {
    this.props.loadProfile(this.props.address);
    this.props.getDisputedEscrows();
  }

  render() {
    const profile = this.props.profile;
    return (
      <Fragment>
        <UserInformation isArbitrator={profile.isArbitrator} reputation={profile.reputation} address={profile.address} username={profile.username}/>
        
        {profile.isArbitrator && <Fragment>
          <Disputes disputes={this.props.disputes.filter(x => x.arbitration.open)} open={true} showDate={true} />
          <Disputes disputes={this.props.disputes.filter(x => !x.arbitration.open)} open={false} showDate={false} />
        </Fragment>}

        { !profile.isArbitrator && <Fragment>
          <Trades trades={this.props.trades}/>
          <Offers offers={profile.offers} location={profile.location} />
          {profile.username && <StatusContactCode value={profile.statusContactCode} />}
        </Fragment> }
      </Fragment>
    );
  }
}

MyProfile.propTypes = {
  address: PropTypes.string,
  profile: PropTypes.object,
  trades: PropTypes.array,
  disputes: PropTypes.array,
  loadProfile: PropTypes.func,
  getDisputedEscrows: PropTypes.func
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  const profile = metadata.selectors.getProfile(state, address) || NULL_PROFILE;
  return {
    address,
    profile,
    trades: escrow.selectors.getTrades(state, profile.offers.map(offer => offer.id)),
    disputes: arbitration.selectors.escrows(state)
  };
};


export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    getDisputedEscrows: arbitration.actions.getDisputedEscrows
  })(MyProfile);
