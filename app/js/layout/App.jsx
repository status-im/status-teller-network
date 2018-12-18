import React, { Component, Fragment } from 'react';
import { HashRouter, Route } from "react-router-dom";
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import EmbarkJS from 'Embark/EmbarkJS'; // Needed for auto reload

import Header from './Header';
import HomeContainer from '../containers/HomeContainer';
import PriceContainer from '../containers/PriceContainer';
import LicenseContainer from '../containers/LicenseContainer';
import MapContainer from '../containers/MapContainer';

import prices from '../features/prices';

const relevantPairs = {
  from: ['ETH', 'SNT'],
  to: ['USD']
};

class App extends Component {
  constructor(props) {
    super(props);
    this.props.fetchPrices(relevantPairs);
    this.state = { ready: false }
  }

  componentDidMount() {
    EmbarkJS.onReady(async (err) => {
      if (!err) {
        this.setState({ ready: true })
      }
    });
  }

  render() {
    if (!this.state.ready) {
      return <p>Connecting...</p>
    }

    return (
      <HashRouter>
        <Fragment>
          <Header />
          <Container>
            <Route exact path="/" component={HomeContainer} />
            <Route path="/price" component={PriceContainer} />
            <Route path="/license" component={LicenseContainer} />
            <Route path="/map" component={MapContainer} />
          </Container>
        </Fragment>
      </HashRouter>
    );
  }
}

export default connect(
  null, 
  { 
    fetchPrices: prices.actions.fetchPrices
  }
)(App)
