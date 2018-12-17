import React, { Component, Fragment } from 'react';
import { HashRouter, Route } from "react-router-dom";
import { Container } from 'reactstrap';

import Header from './Header';
import HomeContainer from '../containers/HomeContainer';
import HelloContainer from '../containers/HelloContainer';
import PriceContainer from '../containers/PriceContainer';

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Fragment>
          <Header />
          <Container>
            <Route exact path="/" component={HomeContainer} />
            <Route path="/hello" component={HelloContainer} />
            <Route path="/price" component={PriceContainer} />
          </Container>
        </Fragment>
      </HashRouter>
    );
  }
}

export default App;
