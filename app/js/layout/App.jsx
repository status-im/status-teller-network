import React, { Component, Fragment } from 'react';
import { Container } from 'reactstrap';

import Header from './Header';

class App extends Component {
  render() {
    return (
      <Fragment>
        <Header />
        <Container>
        </Container>
      </Fragment>
    );
  }
}
 
export default App;