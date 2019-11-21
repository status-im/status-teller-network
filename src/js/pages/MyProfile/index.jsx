import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";

import metadata from '../../features/metadata';
import network from '../../features/network';
import escrow from '../../features/escrow';
import arbitration from '../../features/arbitration';
import events from "../../features/events";

import { zeroAddress, addressCompare } from '../../utils/address';

import UserInformation from '../../components/UserInformation';
import Loading from "../../components/Loading";

import Separator from './components/Separator';
import StatusContactCode from './components/StatusContactCode';
import ProfileButton from './components/ProfileButton';

import iconTrades from '../../../images/change.svg';
import iconOffers from '../../../images/make_admin.svg';
import iconDisputes from '../../../images/info.svg';
import iconBecomeArbitrator from '../../../images/arbitrator.svg';

import "./index.scss";
import {withNamespaces} from "react-i18next";

const NULL_PROFILE = {
  address: zeroAddress,
  username: '',
  statusContactCode: '0x0000000000000000000000000000000000000000',
  reputation: {upCount: 0, downCount: 0},
  offers: []
};

class MyProfile extends Component {
  constructor(props) {
    super(props);
    if (props.trades) {
      this.watchEscrows();
    }
  }

  componentDidMount() {
    if (!this.props.isEip1102Enabled) {
      return this.props.enableEthereum();
    }
    this.load();

  }

  componentDidUpdate(oldProps) {
    if (!oldProps.isEip1102Enabled && this.props.isEip1102Enabled) {
      this.load();
    }

    if(this.props.profile && !this.props.profile.contactData){
      return this.props.history.push("/profile/contact/edit");
    }

    if ((!oldProps.trades && this.props.trades) || oldProps.trades.length !== this.props.trades.length) {
      this.watchEscrows();
    }
  }

  load() {
    this.props.loadProfile(this.props.address);
    this.props.getDisputedEscrows();
    this.props.getArbitratorRequests();
  }

  watchEscrows() {
    this.props.trades.forEach(trade => {
      if (!this.props.escrowEvents[trade.escrowId] &&
        (trade.status === escrow.helpers.tradeStates.funded ||
          trade.status === escrow.helpers.tradeStates.arbitration_open ||
          trade.status === escrow.helpers.tradeStates.paid ||
          trade.status === escrow.helpers.tradeStates.waiting)) {
        this.props.watchEscrow(trade.escrowId);
        }
      });
  }

  render() {
    const {t, profile, address, requests, trades} = this.props;

    if (!this.props.isEip1102Enabled) {
      return <p>{t('ethereumEnable.profile')}</p>;
    }

    if(!profile) return <Loading page={true} />;

    const activeOffers = profile.offers.filter(x => !x.deleted).length;
    const pendingRequests = requests.reduce((a, b) => a + (b.status === arbitration.constants.AWAIT ? 1 : 0), 0);
    const openDisputes = this.props.disputes.filter(x => x.arbitration.open && !addressCompare(x.seller, address) && !addressCompare(x.buyer, address) && addressCompare(x.arbitrator, address));
    const activeTrades = trades.filter(x => !escrow.helpers.completedStates.includes(x.status)).length;

    return (
      <Fragment>
        {profile.statusContactCode !== zeroAddress && <UserInformation isArbitrator={profile.isArbitrator} reputation={profile.reputation} identiconSeed={profile.statusContactCode} username={profile.username}/>}
        <ProfileButton linkTo="/profile/trades" image={iconTrades} title="My trades" subtitle={`${activeTrades} active`} />
        <ProfileButton linkTo="/profile/offers" image={iconOffers} title="My offers" subtitle={`${activeOffers} active`} />
        <ProfileButton linkTo="/profile/disputes" image={iconDisputes} title="Disputes" subtitle={`${openDisputes.length} active`} />
        <Separator />
        {!profile.isArbitrator && <ProfileButton linkTo="/arbitrator/license" image={iconBecomeArbitrator} title="Become an arbitrator" subtitle="Make tokens by judging disputes" /> }
        <ProfileButton linkTo="/profile/arbitrators" image={iconDisputes} title="Manage arbitrators" subtitle="Some explanation text here" />
        { profile.isArbitrator && <ProfileButton linkTo="/sellers" image={iconDisputes} title="Manage sellers" subtitle={`${pendingRequests} pending requests`} /> }
        {profile.username && <StatusContactCode value={profile.statusContactCode} />}
      </Fragment>
    );
  }
}

MyProfile.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  address: PropTypes.string,
  profile: PropTypes.object,
  trades: PropTypes.array,
  disputes: PropTypes.array,
  loadProfile: PropTypes.func,
  getDisputedEscrows: PropTypes.func,
  escrowEvents: PropTypes.object,
  watchEscrow: PropTypes.func,
  deleteOffer: PropTypes.func,
  isEip1102Enabled: PropTypes.bool,
  requests: PropTypes.array,
  enableEthereum: PropTypes.func,
  getArbitratorRequests: PropTypes.func
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  const profile = metadata.selectors.getProfile(state, address) || NULL_PROFILE;
  return {
    address,
    profile,
    trades: escrow.selectors.getTrades(state, address, profile.offers.map(offer => offer.id)),
    disputes: arbitration.selectors.escrows(state),
    escrowEvents: events.selectors.getEscrowEvents(state),
    txHash: metadata.selectors.txHash(state),
    requests: arbitration.selectors.getArbitratorRequests(state),
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    getDisputedEscrows: arbitration.actions.getDisputedEscrows,
    watchEscrow: escrow.actions.watchEscrow,
    getArbitratorRequests: arbitration.actions.getArbitratorRequests,
    enableEthereum: metadata.actions.enableEthereum
  })(withRouter(withNamespaces()(MyProfile)));
