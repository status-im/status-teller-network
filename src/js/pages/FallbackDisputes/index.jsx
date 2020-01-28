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
    this.props.getDisputedEscrows(true);
  }

  render() {
    const {profile, address} = this.props;
    if (!profile) return <Loading page={true}/>;

    if (!profile.isArbitrator) {
      return <NoLicense arbitratorPage/>;
    }

    return (
      <Fragment>
        <Disputes disputes={this.props.disputes.filter(x => x.arbitration.open && !addressCompare(x.seller, address) && !addressCompare(x.buyer, address))} open={true} showDate={true} />
        <Disputes disputes={this.props.disputes.filter(x => !x.arbitration.open && !addressCompare(x.seller, address) && !addressCompare(x.buyer, address))} open={false} showDate={false} />
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
  getDisputedEscrows: PropTypes.func
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  const profile = metadata.selectors.getProfile(state, address) || NULL_PROFILE;
  return {
    address,
    profile,
    disputes: arbitration.selectors.escrows(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    getDisputedEscrows: arbitration.actions.getDisputedEscrows
  })(withRouter(MyDisputes));
