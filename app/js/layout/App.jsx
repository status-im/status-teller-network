import React, { Component, Fragment } from 'react';
import { HashRouter, Route } from "react-router-dom";
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';


import Header from './Header';
import HomeContainer from '../containers/HomeContainer';
import PriceContainer from '../containers/PriceContainer';
import LicenseContainer from '../containers/EscrowsContainer';
import MapContainer from '../containers/MapContainer';

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
        <Fragment>
          <Header />
          <Container>
            <Route exact path="/" component={HomeContainer} />
            <Route path="/price" component={PriceContainer} />
            <Route path="/escrows" component={LicenseContainer} />
            <Route path="/map" component={MapContainer} />
          </Container>
        </Fragment>
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
