import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";
import metadata from '../../features/metadata';
import network from '../../features/network';
import escrow from '../../features/escrow';
import arbitration from '../../features/arbitration';
import events from "../../features/events";
import emailNotifications from '../../features/emailNotifications';

import { zeroAddress, addressCompare } from '../../utils/address';

import ConnectWallet from '../../components/ConnectWallet';
import UserInformation from '../../components/UserInformation';
import Loading from "../../components/Loading";
import Separator from './components/Separator';
import ProfileButton from './components/ProfileButton';

import iconTrades from '../../../images/change.svg';
import iconOffers from '../../../images/make_admin.svg';
import iconArbitrator from '../../../images/arbitrator.svg';
import iconDispute from '../../../images/dispute.svg';
import iconBecomeArbi from '../../../images/becomeArbi.svg';
import iconSettings from '../../../images/settings.svg';

import "./index.scss";
import {withTranslation} from "react-i18next";

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
    if (this.props.isEip1102Enabled) {
      this.load();
    }
  }

  componentDidUpdate(oldProps) {
    if (!oldProps.isEip1102Enabled && this.props.isEip1102Enabled) {
      this.load();
    }

    if(!oldProps.isFallbackArbitrator && this.props.isFallbackArbitrator) {
      this.props.getDisputedEscrows(true);
    }

    if(this.props.profile && this.props.profile.isArbitrator && !this.props.profile.contactData){
      return this.props.history.push("/profile/settings/contact");
    }

    if ((!oldProps.trades && this.props.trades) || oldProps.trades.length !== this.props.trades.length) {
      this.watchEscrows();
    }
  }

  load() {
    this.props.loadProfile(this.props.address);
    this.props.getDisputedEscrows(this.props.isFallbackArbitrator);
    this.props.getArbitratorRequests();
    this.props.resetNotificationWarnings();
    this.props.checkIfFallbackArbitrator();
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
    const {t, profile, address, requests, trades, enableEthereum, isFallbackArbitrator} = this.props;

    if (!this.props.isEip1102Enabled || !this.props.address) {
      return <ConnectWallet enableEthereum={enableEthereum} />;
    }

    if(!profile) return <Loading page={true} />;

    const activeOffers = profile.offers.filter(x => !x.deleted && !addressCompare(x.arbitrator, zeroAddress)).length;
    const pendingRequests = requests.reduce((a, b) => a + (b.status === arbitration.constants.AWAIT ? 1 : 0), 0);
    const openDisputes = this.props.disputes.filter(x => x.arbitration.open && !addressCompare(x.seller, address) && !addressCompare(x.buyer, address) && addressCompare(x.arbitrator, address));
    const openFallbackDisputes = this.props.disputes.filter(x => x.isFallback && x.arbitration.open);
    const activeTrades = trades.filter(x => !escrow.helpers.completedStates.includes(x.status)).length;

    return (
      <Fragment>
        <UserInformation isArbitrator={profile.isArbitrator} isFallbackArbitrator={isFallbackArbitrator} reputation={profile.reputation}
                         identiconSeed={profile.address} username={profile.username}/>
        <ProfileButton linkTo="/profile/trades" image={iconTrades} title={t('profile.myTrades')}
                       subtitle={t('profile.nbActive', {nb: activeTrades})} actionNeeded={this.props.tradeActionNeeded}/>
        <ProfileButton linkTo="/profile/offers" image={iconOffers} title={t('profile.myOffers')}
                       subtitle={t('profile.nbActive', {nb: activeOffers})}/>
        <ProfileButton linkTo="/profile/arbitrators" image={iconArbitrator} title={t('profile.myArbitrators')}
                       subtitle={t('profile.requestApproval')}/>
        {!profile.isArbitrator && (
        <Fragment>
          <Separator/>
          <ProfileButton linkTo="/arbitrator/license" image={iconBecomeArbi} title={t('profile.becomeArbitrator')}
                       subtitle={t('profile.makeTokensByJudging')}/>
        </Fragment>
        )}

        {profile.isArbitrator && (
        <Fragment>
          <p className="text-muted mt-4">{t('profile.arbitrator')}</p>
          <ProfileButton linkTo="/profile/disputes" image={iconDispute} title={t('profile.disputes')}
                         subtitle={t('profile.disputesToResolve', {nbDisputes: openDisputes.length})}
                         actionNeeded={this.props.arbitrationActionNeeded}/>
          <ProfileButton linkTo="/sellers" image={iconSettings} title={t('profile.arbitratorSettings')}
                         subtitle={t('profile.pendingRequests', {nbRequests: pendingRequests})}/>
          <Separator/>
        </Fragment>
        )}

        {isFallbackArbitrator && (
          <Fragment>
          <p className="text-muted mt-4">{t('profile.fallbackArbitrator')}</p>
          <ProfileButton linkTo="/profile/disputes/fallback" image={iconDispute} title={t('profile.fallbackDisputes')}
                         subtitle={t('profile.disputesToResolve', {nbDisputes: openFallbackDisputes.length})}
                         active={true}/>
          <Separator/>
        </Fragment>
        )}

        <ProfileButton linkTo="/profile/settings" image={iconSettings} title={t('profile.profileSettings')}/>
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
  tradeActionNeeded: PropTypes.number,
  arbitrationActionNeeded: PropTypes.number,
  requests: PropTypes.array,
  enableEthereum: PropTypes.func,
  getArbitratorRequests: PropTypes.func,
  resetNotificationWarnings: PropTypes.func,
  checkIfFallbackArbitrator: PropTypes.func,
  isFallbackArbitrator: PropTypes.bool
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
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state),
    tradeActionNeeded: escrow.selectors.actionNeeded(state),
    arbitrationActionNeeded: arbitration.selectors.actionNeeded(state),
    isFallbackArbitrator: arbitration.selectors.isFallbackArbitrator(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    checkIfFallbackArbitrator: arbitration.actions.checkIfFallbackArbitrator,
    getDisputedEscrows: arbitration.actions.getDisputedEscrows,
    watchEscrow: escrow.actions.watchEscrow,
    getArbitratorRequests: arbitration.actions.getArbitratorRequests,
    enableEthereum: metadata.actions.enableEthereum,
    resetNotificationWarnings: emailNotifications.actions.resetNotificationWarnings
  })(withRouter(withTranslation()(MyProfile)));
