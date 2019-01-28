import React, { Component } from 'react';
import { HashRouter, Route } from "react-router-dom";
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';

import Wizard from '../components/Wizard';

import HomeContainer from '../containers/HomeContainer';
import BuyStartContainer from '../containers/Buy/StartContainer';
import BuyPaymentTypeContainer from '../containers/Buy/PaymentTypeContainer';

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
          <Route exact path="/" component={HomeContainer} />
          <Wizard path="/buy/" steps={[
            { path: '/buy/start', render: (wizard) => <BuyStartContainer wizard={wizard} />},
            { path: '/buy/payment-type', render: (wizard) => <BuyPaymentTypeContainer wizard={wizard} />}
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
