import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";

import metadata from '../../features/metadata';
import network from '../../features/network';
import arbitration from '../../features/arbitration';

import NoLicense from '../../components/NoLicense';
import Disputes from './components/Disputes';
import { zeroAddress, addressCompare } from '../../utils/address';

import "./index.scss";
import Loading from "../../components/Loading";

const NULL_PROFILE = {
  address: zeroAddress,
  username: '',
  statusContactCode: '',
  reputation: {upCount: 0, downCount: 0},
  offers: []
};

class MyDisputes extends Component {

  componentDidMount() {
    this.props.loadProfile(this.props.address);
    this.props.getFallbackArbitrator();
    this.props.getDisputedEscrows(this.props.includeFallbackDisputes, true);
  }

  componentDidUpdate() {
    if (this.props.profile && this.props.profile.isArbitrator && !this.props.profile.contactData) {
      return this.props.history.push("/profile/settings/contact");
    }
  }


  render() {
    const {profile, address, includeFallbackDisputes, fallbackArbitrator, network, isFallbackArbitrator} = this.props;
    if (!profile) return <Loading page={true}/>;

    if (!profile.isArbitrator && !isFallbackArbitrator) {
      return <NoLicense arbitratorPage/>;
    }
    
    return (
      <Fragment>
        {includeFallbackDisputes && <p>
          Multisig: <a href={"https://" + (network.name == "rinkeby" ? "rinkeby." : "") + "gnosis-safe.io/safes/" + fallbackArbitrator} target="_blank" rel="noopener noreferrer">{fallbackArbitrator}</a>
        </p>}
        <Disputes disputes={this.props.disputes.filter(x => x.arbitration.open && (includeFallbackDisputes || (!addressCompare(x.seller, address) && !addressCompare(x.buyer, address) && addressCompare(x.arbitrator, address))))} open={true} showDate={true} includeFallbackDisputes={includeFallbackDisputes} />
        <Disputes disputes={this.props.disputes.filter(x => !x.arbitration.open && (includeFallbackDisputes || (!addressCompare(x.seller, address) && !addressCompare(x.buyer, address) && addressCompare(x.arbitrator, address))))} open={false} showDate={false} includeFallbackDisputes={includeFallbackDisputes} />
      </Fragment>
    );
  }
}

MyDisputes.propTypes = {
  history: PropTypes.object,
  address: PropTypes.string,
  profile: PropTypes.object,
  disputes: PropTypes.array,
  loadProfile: PropTypes.func,
  getDisputedEscrows: PropTypes.func,
  includeFallbackDisputes: PropTypes.bool,
  getFallbackArbitrator: PropTypes.func,
  fallbackArbitrator: PropTypes.string,
  isFallbackArbitrator: PropTypes.bool,
  network: PropTypes.object
};

const mapStateToProps = (state, props) => {
  const address = network.selectors.getAddress(state) || '';
  const profile = metadata.selectors.getProfile(state, address) || NULL_PROFILE;
  return {
    address,
    profile,
    includeFallbackDisputes:  !!props.match.params.includeFallbackDisputes,
    disputes: arbitration.selectors.escrows(state),
    fallbackArbitrator: arbitration.selectors.fallbackArbitrator(state),
    network: network.selectors.getNetwork(state),
    isFallbackArbitrator: arbitration.selectors.isFallbackArbitrator(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    getDisputedEscrows: arbitration.actions.getDisputedEscrows,
    getFallbackArbitrator: arbitration.actions.getFallbackArbitrator
  })(withRouter(MyDisputes));
