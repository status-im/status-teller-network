import React, { Component } from 'react';
import { HashRouter, Route } from "react-router-dom";
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';

import Wizard from '../components/Wizard';
import Header from "../components/Header";

import HomeContainer from '../containers/HomeContainer';

// Buyer
import BuyStartContainer from '../containers/Buy/StartContainer';
import BuyPaymentTypeContainer from '../containers/Buy/PaymentTypeContainer';

// Seller
import SellerStartContainer from '../containers/Seller/SellerStartContainer';
import SellerPositionContainer from '../containers/Seller/SellerPositionContainer';

import ProfileContainer from '../containers/ProfileContainer';

import PriceContainer from '../containers/PriceContainer';
import LicenseContainer from '../containers/EscrowsContainer';
import MapContainer from '../containers/MapContainer';
import SignatureContainer from '../containers/SignatureContainer';
import ArbitrationContainer from '../containers/ArbitrationContainer';
import SellerFiatContainer from '../containers/SellerFiatContainer';
import SellerMarginContainer from '../containers/SellerMarginContainer';

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
        <Container className="h-100">
          <Header/>
          <Route exact path="/" component={HomeContainer} />
          <Route exact path="/profile" component={ProfileContainer} />
          <Wizard path="/buy/" steps={[
            { path: '/buy/start', component: BuyStartContainer },
            { path: '/buy/payment-type', component: BuyPaymentTypeContainer }
          ]}/>
          <Wizard path="/sell/" steps={[
            { path: '/sell/start', component: SellerStartContainer },
            { path: '/sell/location', component: SellerPositionContainer },
            // { path: '/sell/payment-type', render: (wizard) => <SellerPaymentTypeContainer wizard={wizard} />}
          ]}/>

          <Route path="/price" component={PriceContainer} />
          <Route path="/escrows" component={LicenseContainer} />
          <Route path="/map" component={MapContainer} />
          <Route path="/signature" component={SignatureContainer} />
          <Route path="/arbitration" component={ArbitrationContainer} />
          <Route path="/seller/fiat" component={SellerFiatContainer} />
          <Route path="/seller/margin" component={SellerMarginContainer} />
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
