import React, { Component, Fragment } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { Container } from 'reactstrap';

import Header from './Header';
import HomeContainer from '../containers/HomeContainer';
import HelloContainer from '../containers/HelloContainer';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Fragment>
          <Header />
          <Container>  
            <Route exact path="/" component={HomeContainer} />
            <Route path="/hello" component={HelloContainer} />
          </Container>
        </Fragment>
      </BrowserRouter>
    );
  }
}
 
export default App;