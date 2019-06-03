/*global web3*/
import React, {Component, Fragment} from 'react';
import {HashRouter, Route, Switch} from "react-router-dom";
import {connect} from 'react-redux';
import {Container} from 'reactstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Header from "./Header";
import Wizard from '../wizards/Wizard';
import Loading from "../components/Loading";
import ErrorInformation from '../components/ErrorInformation';
import fourOFour from '../components/ErrorInformation/404';

import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Escrow from '../pages/Escrow';
import OpenDispute from '../pages/OpenDispute';
import Arbitration from '../pages/Arbitration';
import MyProfile from '../pages/MyProfile';
import EditMyContact from '../pages/EditMyContact';
import License from '../pages/License';
import ArbitrationLicense from '../pages/ArbitrationLicense';
import OffersList from '../pages/OffersList';
import OffersMap from '../pages/OffersMap';
import Settings from '../pages/Settings';
import BackButton from '../ui/BackButton';
import NotificationManager from '../components/NotificationManager';

// Buy
import BuyContact from '../wizards/Buy/0_Contact';
import BuyTrade from '../wizards/Buy/1_Trade';

// Sell
import SellLocation from '../wizards/Sell/0_Location';
import SellContact from '../wizards/Sell/1_Contact';
import SellAsset from '../wizards/Sell/2_Asset';
import SellPaymentMethods from '../wizards/Sell/3_PaymentMethods';
import SellArbitrator from '../wizards/Sell/4_SelectArbitrator';
import SellCurrency from '../wizards/Sell/5_Currency';
import SellMargin from '../wizards/Sell/6_Margin';

// Tmp
import SignatureContainer from '../pages/tmp/SignatureContainer';

import prices from '../features/prices';
import network from '../features/network';
import metadata from '../features/metadata';
import escrow from '../features/escrow';
import license from "../features/license";

const PRICE_FETCH_INTERVAL = 60000;

class App extends Component {
  constructor(props) {
    super(props);
    this.props.init();
    this.watchingTrades = false;
    setInterval(() => {
      this.props.getGasPrice();
      this.props.fetchExchangeRates();
    }, PRICE_FETCH_INTERVAL);
    if (this.props.profile && this.props.profile.offers) {
      this.watchTradesForOffers();
    }
  }
  
  componentDidUpdate(prevProps) {
    if (!prevProps.isReady && this.props.isReady) {
      if (this.props.currentUser && this.props.currentUser !== web3.eth.defaultAccount) {
        this.props.resetState();
      }
      this.props.loadProfile(this.props.address);
      this.props.checkLicenseOwner();
      this.props.setCurrentUser(web3.eth.defaultAccount);
    }
    if (!this.watchingTrades && ((!prevProps.profile && this.props.profile && this.props.profile.offers) || (prevProps.profile && !prevProps.profile.offers && this.props.profile.offers))) {
      this.watchTradesForOffers();
    }
  }

  watchTradesForOffers() {
    if (this.watchingTrades) {
      return;
    }
    this.props.watchEscrowCreations(this.props.profile.offers);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.isReady !== this.props.isReady ||
      !_.isEqual(nextProps.profile, this.props.profile) ||
      nextProps.error !== this.props.error ||
      nextProps.hasToken !== this.props.hasToken ||
      nextProps.isLicenseOwner !== this.props.isLicenseOwner;
  }

  render() {
    if (this.props.error) {
      console.error(this.props.error);
      return <ErrorInformation provider/>;
    }

    if (!this.props.isReady) {
      return <Loading initial/>;
    }

    if (!this.props.hasToken) {
      return <ErrorInformation network/>;
    }

    return (
      <Fragment>
        <HashRouter>
          <Container className="p-0">
            <NotificationManager/>
            <Header profile={this.props.profile}/>
            <div className="body-content">
              <BackButton/>
              <Switch>
                <Route exact path="/" component={Home}/>

                <Route exact path="/settings" component={Settings}/>

                <Route exact path="/profile" component={MyProfile}/>
                <Route exact path="/profile/contact/edit" component={EditMyContact}/>
                <Route exact path="/profile/:address" component={Profile}/>

                <Route exact path="/arbitrator/license" component={ArbitrationLicense}/>
                <Route exact path="/license" component={License}/>
                <Route exact path="/escrow/:id" component={Escrow}/>
                <Route exact path="/arbitration/:id" component={Arbitration}/>
                <Route exact path="/openCase/:id" component={OpenDispute}/>

                <Route exact path="/offers/list" component={OffersList}/>
                <Route exact path="/offers/map" component={OffersMap}/>

                <Wizard path="/buy/" steps={[
                  {path: '/buy/contact', component: BuyContact},
                  {path: '/buy/trade', component: BuyTrade}
                ]}/>

                {this.props.isLicenseOwner &&
                <Wizard path="/sell/" steps={[
                  {path: '/sell/location', component: SellLocation},
                  {path: '/sell/contact', component: SellContact},
                  {path: '/sell/asset', component: SellAsset},
                  {path: '/sell/payment-methods', component: SellPaymentMethods},
                  {path: '/sell/arbitrator', component: SellArbitrator},
                  {path: '/sell/currency', component: SellCurrency},
                  {path: '/sell/margin', component: SellMargin, nextLabel: 'Post the offer'}
                ]}/>
                }

                <Route path="/tmp/signature" component={SignatureContainer}/>

                <Route component={fourOFour}/>
              </Switch>
            </div>
          </Container>
        </HashRouter>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    currentUser: metadata.selectors.currentUser(state),
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    isReady: network.selectors.isReady(state),
    hasToken: Object.keys(network.selectors.getTokens(state)).length > 0,
    error: network.selectors.getError(state),
    profile: metadata.selectors.getProfile(state, address),
    newEscrow: escrow.selectors.newEscrow(state)
  };
};

App.propTypes = {
  init: PropTypes.func,
  error: PropTypes.string,
  fetchPrices: PropTypes.func,
  fetchExchangeRates: PropTypes.func,
  getGasPrice: PropTypes.func,
  isReady: PropTypes.bool,
  hasToken: PropTypes.bool,
  address: PropTypes.string,
  profile: PropTypes.object,
  loadProfile: PropTypes.func,
  checkLicenseOwner: PropTypes.func,
  setCurrentUser: PropTypes.func,
  resetState: PropTypes.func,
  isLicenseOwner: PropTypes.bool,
  currentUser: PropTypes.string,
  watchEscrowCreations: PropTypes.func
};

export default connect(
  mapStateToProps,
  {
    fetchPrices: prices.actions.fetchPrices,
    fetchExchangeRates: prices.actions.fetchExchangeRates,
    getGasPrice: network.actions.getGasPrice,
    init: network.actions.init,
    resetState: network.actions.resetState,
    loadProfile: metadata.actions.load,
    checkLicenseOwner: license.actions.checkLicenseOwner,
    setCurrentUser: metadata.actions.setCurrentUser,
    watchEscrowCreations: escrow.actions.watchEscrowCreations
  }
)(App);
