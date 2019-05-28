import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";

import metadata from '../../features/metadata';
import network from '../../features/network';
import escrow from '../../features/escrow';
import arbitration from '../../features/arbitration';

import UserInformation from '../../components/UserInformation';
import Trades from './components/Trades';
import Offers from './components/Offers';
import Disputes from './components/Disputes';
import StatusContactCode from './components/StatusContactCode';
import { zeroAddress, addressCompare } from '../../utils/address';

import "./index.scss";
import Loading from "../../components/Loading";

const NULL_PROFILE = {
  address: zeroAddress,
  username: '',
  statusContactCode: '0x0000000000000000000000000000000000000000',
  reputation: {upCount: 0, downCount: 0},
  offers: []
};

class MyProfile extends Component {
  componentDidMount() {
    this.props.loadProfile(this.props.address);
    this.props.getDisputedEscrows();
    this.props.getArbitrators();
  }

  componentDidUpdate(){
    if(this.props.profile && this.props.profile.isArbitrator && !this.props.profile.statusContactCode){
      this.props.history.push("/profile/contact/edit");
    }
  }

  render() {
    const {profile, address} = this.props;
    if(!profile) return <Loading page={true} />;

    const trades = this.props.trades.map(x => {
      const dispute = this.props.disputes.find(y => y.escrowId === x.escrowId);
      if(dispute){
        x.arbitration = dispute.arbitration;
      }
      return x;
    });


    return (
      <Fragment>
        <UserInformation isArbitrator={profile.isArbitrator} reputation={profile.reputation} identiconSeed={profile.statusContactCode} username={profile.username}/>

        {profile.isArbitrator && <Fragment>
          <Disputes disputes={this.props.disputes.filter(x => x.arbitration.open && !addressCompare(x.seller, address) && !addressCompare(x.buyer, address) && addressCompare(x.arbitrator, address))} open={true} showDate={true} />
          <Disputes disputes={this.props.disputes.filter(x => !x.arbitration.open && !addressCompare(x.seller, address) && !addressCompare(x.buyer, address) && addressCompare(x.arbitrator, address))} open={false} showDate={false} />
        </Fragment>}

        <Fragment>
          <Trades trades={trades} address={this.props.address}/>
          <Offers offers={profile.offers} location={profile.location} />
          {profile.username && <StatusContactCode value={profile.statusContactCode} />}
        </Fragment>
      </Fragment>
    );
  }
}

MyProfile.propTypes = {
  history: PropTypes.object,
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
  })(withRouter(MyProfile));
