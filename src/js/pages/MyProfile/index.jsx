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

import "./index.scss";

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
    this.props.getArbitrators();
  }

  render() {
    const profile = this.props.profile;

    const trades = this.props.trades.map(x => {
      const dispute = this.props.disputes.find(y => y.escrowId === x.escrowId);
      if(dispute){
        x.arbitration = dispute.arbitration;
      }
      return x;
    });

    return (
      <Fragment>
        <UserInformation isArbitrator={profile.isArbitrator} reputation={profile.reputation} address={profile.address} username={profile.username}/>
        
        {profile.isArbitrator && <Fragment>
          <Disputes disputes={this.props.disputes.filter(x => x.arbitration.open)} open={true} showDate={true} />
          <Disputes disputes={this.props.disputes.filter(x => !x.arbitration.open)} open={false} showDate={false} />
        </Fragment>}

        { !profile.isArbitrator && <Fragment>
          <Trades trades={trades} address={this.props.address}/>
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
  getDisputedEscrows: PropTypes.func,
  getArbitrators: PropTypes.func,
  arbitrators: PropTypes.array
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  const profile = metadata.selectors.getProfile(state, address) || NULL_PROFILE;
  return {
    address,
    profile,
    trades: escrow.selectors.getTrades(state, address, profile.offers.map(offer => offer.id)),
    disputes: arbitration.selectors.escrows(state),
    arbitrators: arbitration.selectors.arbitrators(state)
  };
};


export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    getDisputedEscrows: arbitration.actions.getDisputedEscrows,
    getArbitrators: arbitration.actions.getArbitrators
  })(MyProfile);
