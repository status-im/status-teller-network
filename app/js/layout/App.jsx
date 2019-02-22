import React, {Component} from 'react';
import {HashRouter, Route, Redirect, Switch} from "react-router-dom";
import {connect} from 'react-redux';
import {Container} from 'reactstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Wizard from '../wizards/Wizard';
import Header from "../components/Header";
import Loading from "../components/ui/Loading";
import ErrorInformation from '../components/ui/ErrorInformation';

import HomeContainer from '../containers/HomeContainer';
import ProfileContainer from '../containers/MyProfileContainer';
import EditProfileContainer from '../containers/EditMyContactContainer';
import LicenseContainer from '../containers/LicenseContainer';

// Buyer
import OfferListContainer from '../containers/Buyer/OfferListContainer';
import BankOfferListContainer from '../containers/Buyer/BankOfferListContainer';
import MapContainer from '../containers/Buyer/MapContainer';
import SellerProfileContainer from '../pages/ProfileContainer/SellerProfileContainer';
import OfferTradeContainer from '../containers/Buyer/OfferTradeContainer';
import BuyerContactContainer from '../containers/Buyer/BuyerContactContainer';

// Seller
import SellerAssetContainer from '../containers/Seller/0_SellAssetContainer';
import SellerLocationContainer from '../containers/Seller/1_SellLocationContainer';
import SellerPaymentMethodsContainer from '../containers/Seller/2_SellPaymentMethodsContainer';
import SellerCurrencyContainer from '../containers/Seller/3_SellCurrencyContainer';
import SellerMarginContainer from '../containers/Seller/4_SellMarginContainer';
import SellerContactContainer from '../containers/Seller/5_SellContactContainer';

// Tmp
import EscrowsContainer from '../containers/tmp/EscrowsContainer';
import SignatureContainer from '../containers/tmp/SignatureContainer';
import ArbitrationContainer from '../containers/tmp/ArbitrationContainer';

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
            <Route exact path="/" component={HomeContainer}/>

            <Route exact path="/profile" component={MyProfileContainer}/>
            <Route exact path="/profile/contact/edit" component={EditMyContactContainer}/>
            <Route exact path="/profile/:address" component={ProfileContainer}/>

            <Route exact path="/license" component={LicenseContainer}/>


            <Route exact path="/offers/list" component={OffersListContainer}/>
            <Route exact path="/offers/map" component={OffersMapContainer}/>
            
            <Wizard path="/offers/:id" steps={[
              {path: '/offers/:id/contact', component: BuyContactContainer},
              {path: '/offers/:id/trade', component: BuyTradeContainer}
            ]}/>

            {this.props.isLicenseOwner &&
              <Wizard path="/sell/" steps={[
                {path: '/sell/asset', component: SellAssetContainer},
                {path: '/sell/location', component: SellLocationContainer},
                {path: '/sell/payment-methods', component: SellPaymentMethodsContainer},
                {path: '/sell/currency', component: SellCurrencyContainer},
                {path: '/sell/margin', component: SellMarginContainer, nextLabel: 'Confirm price'},
                {path: '/sell/contact', component: SellContactContainer, nextLabel: 'Post the offer'}
              ]}/>
            }

            <Route path="/tmp/escrows" component={EscrowsContainer}/>
            <Route path="/tmp/signature" component={SignatureContainer}/>
            <Route path="/tmp/arbitration" component={ArbitrationContainer}/>

            <Redirect to="/"/>
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
