import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";

import metadata from '../../features/metadata';
import network from '../../features/network';

import Offers from './components/Offers';
import { zeroAddress } from '../../utils/address';

import Loading from "../../components/Loading";
import { States } from '../../utils/transaction';

const NULL_PROFILE = {
  address: zeroAddress,
  username: '',
  contactData: '',
  reputation: {upCount: 0, downCount: 0},
  offers: []
};

class MyProfile extends Component {
  componentDidMount() {
    this.props.loadProfile(this.props.address);
  }

  componentDidUpdate(){
    if(this.props.profile && !this.props.profile.contactData){
      return this.props.history.push("/profile/contact/edit");
    }
  }
  render() {
    const {profile, deleteOfferStatus, txHash} = this.props;
    if(!profile) return <Loading page={true} />;

    if(deleteOfferStatus === States.pending) {
      return <Loading mining={true} txHash={txHash}/>;
    }

    return <Offers offers={profile.offers} location={profile.location} deleteOffer={this.props.deleteOffer} />;
  }
}

MyProfile.propTypes = {
  history: PropTypes.object,
  address: PropTypes.string,
  profile: PropTypes.object,
  loadProfile: PropTypes.func,
  deleteOffer: PropTypes.func,
  deleteOfferStatus: PropTypes.string,
  txHash: PropTypes.string
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  const profile = metadata.selectors.getProfile(state, address) || NULL_PROFILE;
  return {
    address,
    profile,
    deleteOfferStatus: metadata.selectors.getDeleteOfferStatus(state),
    txHash: metadata.selectors.txHash(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    deleteOffer: metadata.actions.deleteOffer
  })(withRouter(MyProfile));
