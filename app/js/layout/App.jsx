import React, {Component} from 'react';
import {HashRouter, Route, Redirect, Switch} from "react-router-dom";
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
import Arbitration from '../pages/Arbitration';
import MyProfile from '../pages/MyProfile';
import EditMyContact from '../pages/EditMyContact';
import License from '../pages/License';
import OffersList from '../pages/OffersList';
import OffersMap from '../pages/OffersMap';

// Buy
import BuyContact from '../wizards/Buy/0_Contact';
import BuyTrade from '../wizards/Buy/1_Trade';

// Sell
import SellLocation from '../wizards/Sell/0_Location';
import SellContact from '../wizards/Sell/1_Contact';
import SellAsset from '../wizards/Sell/2_Asset';
import SellPaymentMethods from '../wizards/Sell/3_PaymentMethods';
import SellCurrency from '../wizards/Sell/4_Currency';
import SellMargin from '../wizards/Sell/5_Margin';

// Tmp
import EscrowsContainer from '../pages/tmp/EscrowsContainer';
import SignatureContainer from '../pages/tmp/SignatureContainer';
import ArbitrationContainer from '../pages/tmp/ArbitrationContainer';

import prices from '../features/prices';
import network from '../features/network';
import metadata from '../features/metadata';
import license from "../features/license";

const PRICE_FETCH_INTERVAL = 60000;

class App extends Component {
  constructor(props) {
    super(props);
    this.props.init();
    setInterval(() => {
      this.props.fetchExchangeRates();
    }, PRICE_FETCH_INTERVAL);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isReady && this.props.isReady) {
      this.props.loadProfile(this.props.address);
      this.props.checkLicenseOwner();
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.isReady !== this.props.isReady ||
      !_.isEqual(nextProps.profile, this.props.profile) ||
      nextProps.error !== this.props.error ||
      nextProps.hasToken !== this.props.hasToken ||
      nextProps.isLicenseOwner !== this.props.isLicenseOwner;
  }

  render() {
    if (!this.props.isReady) {
      return <Loading initial/>;
    }

    if (this.props.error) {
      return <ErrorInformation provider/>;
    }

    if (!this.props.hasToken) {
      return <ErrorInformation network/>;
    }

    return (
      <HashRouter>
        <Container>
          <Header profile={this.props.profile}/>
          <Switch>
            <Route exact path="/" component={Home}/>

            <Route exact path="/profile" component={MyProfile}/>
            <Route exact path="/profile/contact/edit" component={EditMyContact}/>
            <Route exact path="/profile/:address" component={Profile}/>

            <Route exact path="/license" component={License}/>
            <Route exact path="/escrow/:id" component={Escrow}/>
            <Route exact path="/arbitration/:id" component={Arbitration}/>


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
                {path: '/sell/currency', component: SellCurrency},
                {path: '/sell/margin', component: SellMargin, nextLabel: 'Post the offer'}
              ]}/>
            }

            <Route path="/404" component={fourOFour}/>

            <Route path="/tmp/escrows" component={EscrowsContainer}/>
            <Route path="/tmp/signature" component={SignatureContainer}/>
            <Route path="/tmp/arbitration" component={ArbitrationContainer}/>

            <Redirect to="/404"/>
          </Switch>
        </Container>
      </HashRouter>
    );
  }
}

const mapStateToProps = (state) => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    isReady: network.selectors.isReady(state),
    hasToken: Object.keys(network.selectors.getTokens(state)).length > 0,
    error: network.selectors.getError(state),
    profile: metadata.selectors.getProfile(state, address)
  };
};

App.propTypes = {
  init: PropTypes.func,
  error: PropTypes.string,
  fetchPrices: PropTypes.func,
  fetchExchangeRates: PropTypes.func,
  isReady: PropTypes.bool,
  hasToken: PropTypes.bool,
  address: PropTypes.string,
  profile: PropTypes.object,
  loadProfile: PropTypes.func,
  checkLicenseOwner: PropTypes.func,
  isLicenseOwner: PropTypes.bool
};

export default connect(
  mapStateToProps,
  {
    fetchPrices: prices.actions.fetchPrices,
    fetchExchangeRates: prices.actions.fetchExchangeRates,
    init: network.actions.init,
    loadProfile: metadata.actions.load,
    checkLicenseOwner: license.actions.checkLicenseOwner
  }
)(App);
