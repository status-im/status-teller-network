import React, {Component} from 'react';
import {HashRouter, Route} from "react-router-dom";
import {connect} from 'react-redux';
import {Container} from 'reactstrap';
import PropTypes from 'prop-types';

import Wizard from '../components/Wizard';
import Header from "../components/Header";

import HomeContainer from '../containers/HomeContainer';

// Buyer
import OfferListContainer from '../containers/Buyer/OfferListContainer';
import BankOfferListContainer from '../containers/Buyer/BankOfferListContainer';
import MapContainer from '../containers/Buyer/MapContainer';
import SellerProfileContainer from '../containers/Buyer/SellerProfileContainer';
import OfferTradeContainer from '../containers/Buyer/OfferTradeContainer';
import BuyerContactContainer from '../containers/Buyer/BuyerContactContainer';

// Seller
import SellerLicenseContainer from '../containers/Seller/SellerLicenseContainer';
import SellerStartContainer from '../containers/Seller/SellerStartContainer';
import SellerPositionContainer from '../containers/Seller/SellerPositionContainer';
import SellerPaymentMethodContainer from '../containers/Seller/SellerPaymentMethodContainer';
import SellerFiatContainer from '../containers/Seller/SellerFiatContainer';
import SellerMarginContainer from '../containers/Seller/SellerMarginContainer';
import SellerContactContainer from '../containers/Seller/SellerContactContainer';

import ProfileContainer from '../containers/ProfileContainer';

import PriceContainer from '../containers/PriceContainer';
import LicenseContainer from '../containers/EscrowsContainer';
import SignatureContainer from '../containers/SignatureContainer';
import ArbitrationContainer from '../containers/ArbitrationContainer';

import prices from '../features/prices';
import embarkjs from '../features/embarkjs';

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

  render() {
    if (!this.props.isReady) {
      return <p>Connecting...</p>;
    }

    return (
      <HashRouter>
        <Container>
          <Header/>
          <Route exact path="/" component={HomeContainer}/>
          <Route exact path="/profile" component={ProfileContainer}/>
          <Route exact path="/buy" component={OfferListContainer}/>
          <Route exact path="/buy/map" component={MapContainer}/>
          <Route exact path="/buy/list" component={BankOfferListContainer}/>
          <Route exact path="/buy/profile/:address" component={SellerProfileContainer}/>
          <Wizard path="/buy/contact" steps={[
            {path: '/buy/contactForm', component: BuyerContactContainer},
            {path: '/buy/offer', component: OfferTradeContainer}
          ]}/>
          <Wizard path="/sell/" steps={[
            {path: '/sell/license', component: SellerLicenseContainer},
            {path: '/sell/start', component: SellerStartContainer},
            {path: '/sell/location', component: SellerPositionContainer},
            {path: '/sell/payment-methods', component: SellerPaymentMethodContainer},
            {path: '/sell/fiat-selector', component: SellerFiatContainer},
            {path: '/sell/margin', component: SellerMarginContainer},
            {path: '/sell/contact', component: SellerContactContainer}
          ]}/>

          <Route path="/price" component={PriceContainer}/>
          <Route path="/escrows" component={LicenseContainer}/>
          <Route path="/map" component={MapContainer}/>
          <Route path="/signature" component={SignatureContainer}/>
          <Route path="/arbitration" component={ArbitrationContainer}/>
        </Container>
      </HashRouter>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isReady: embarkjs.selectors.isReady(state)
  };
};

App.propTypes = {
  init: PropTypes.func,
  fetchPrices: PropTypes.func,
  isReady: PropTypes.bool
};

export default connect(
  mapStateToProps,
  {
    fetchPrices: prices.actions.fetchPrices,
    init: embarkjs.actions.init
  }
)(App);
