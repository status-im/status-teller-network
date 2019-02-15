import React, {Component} from 'react';
import {HashRouter, Route} from "react-router-dom";
import {connect} from 'react-redux';
import {Container} from 'reactstrap';
import PropTypes from 'prop-types';

import Wizard from '../components/Wizard';
import Header from "../components/Header";
import Loading from "../components/ui/Loading";

import HomeContainer from '../containers/HomeContainer';
import ProfileContainer from '../containers/ProfileContainer';
import EditProfileContainer from '../containers/EditProfileContainer';
import LicenseContainer from '../containers/LicenseContainer';

// Buyer
import OfferListContainer from '../containers/Buyer/OfferListContainer';
import BankOfferListContainer from '../containers/Buyer/BankOfferListContainer';
import MapContainer from '../containers/Buyer/MapContainer';
import SellerProfileContainer from '../containers/Buyer/SellerProfileContainer';
import OfferTradeContainer from '../containers/Buyer/OfferTradeContainer';
import BuyerContactContainer from '../containers/Buyer/BuyerContactContainer';

// Seller
import SellerAssetContainer from '../containers/Seller/0_SellerAssetContainer';
import SellerLocationContainer from '../containers/Seller/1_SellerLocationContainer';
import SellerPaymentMethodsContainer from '../containers/Seller/2_SellerPaymentMethodsContainer';
import SellerCurrencyContainer from '../containers/Seller/3_SellerCurrencyContainer';
import SellerMarginContainer from '../containers/Seller/4_SellerMarginContainer';
import SellerContactContainer from '../containers/Seller/5_SellerContactContainer';

// Tmp
import EscrowsContainer from '../containers/tmp/EscrowsContainer';
import PriceContainer from '../containers/tmp/PriceContainer';
import SignatureContainer from '../containers/tmp/SignatureContainer';
import ArbitrationContainer from '../containers/tmp/ArbitrationContainer';

import prices from '../features/prices';
import embarkjs from '../features/embarkjs';
import metadata from '../features/metadata';
import balances from '../features/balances';

const relevantPairs = {
  from: ['ETH', 'SNT'],
  to: ['USD']
};

class App extends Component {
  constructor(props) {
    super(props);
    this.props.init();
    this.props.fetchPrices(relevantPairs);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isReady && this.props.isReady) {
      this.props.loadProfile(this.props.address);
      this.props.updateBalances(this.props.tokens, this.props.address);
    }
  }

  render() {
    if (!this.props.isReady) {
      return <Loading initial/>;
    }

    return (
      <HashRouter>
        <Container>
          <Header profile={this.props.profile}/>
          <Route exact path="/" component={HomeContainer}/>
          <Route exact path="/profile" component={ProfileContainer}/>
          <Route exact path="/profile/edit" component={EditProfileContainer}/>
          <Route exact path="/license" component={LicenseContainer}/>


          <Route exact path="/buy" component={OfferListContainer}/>
          <Route exact path="/buy/map" component={MapContainer}/>
          <Route exact path="/buy/list" component={BankOfferListContainer}/>
          <Route exact path="/buy/profile/:address" component={SellerProfileContainer}/>
          <Wizard path="/buy/contact" steps={[
            {path: '/buy/contactForm', component: BuyerContactContainer},
            {path: '/buy/offer', component: OfferTradeContainer}
          ]}/>

          <Wizard path="/sell/" steps={[
            {path: '/sell/asset', component: SellerAssetContainer},
            {path: '/sell/location', component: SellerLocationContainer},
            {path: '/sell/payment-methods', component: SellerPaymentMethodsContainer},
            {path: '/sell/currency', component: SellerCurrencyContainer},
            {path: '/sell/margin', component: SellerMarginContainer, nextLabel: 'Confirm price'},
            {path: '/sell/contact', component: SellerContactContainer, nextLabel: 'Post the offer'}
          ]}/>

          <Route path="/tmp/price" component={PriceContainer}/>
          <Route path="/tmp/escrows" component={EscrowsContainer}/>
          <Route path="/tmp/map" component={MapContainer}/>
          <Route path="/tmp/signature" component={SignatureContainer}/>
          <Route path="/tmp/arbitration" component={ArbitrationContainer}/>
        </Container>
      </HashRouter>
    );
  }
}

const mapStateToProps = (state) => {
  const address = embarkjs.selectors.getAddress(state) || '';
  return {
    address,
    isReady: embarkjs.selectors.isReady(state),
    tokens: embarkjs.selectors.getTokens(state),
    profile: metadata.selectors.getProfile(state, address)
  };
};

App.propTypes = {
  init: PropTypes.func,
  fetchPrices: PropTypes.func,
  isReady: PropTypes.bool,
  address: PropTypes.string,
  profile: PropTypes.object,
  loadProfile: PropTypes.func,
  tokens: PropTypes.array,
  updateBalances: PropTypes.func
};

export default connect(
  mapStateToProps,
  {
    fetchPrices: prices.actions.fetchPrices,
    init: embarkjs.actions.init,
    loadProfile: metadata.actions.load,
    updateBalances: balances.actions.update
  }
)(App);
