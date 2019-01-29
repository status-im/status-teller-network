import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

import './withFooter.scss';

const Footer = (props) => (
  <footer className="container">
    {props.previous && <Button onClick={props.previous} className="m-2" color="link">&lt; Previous</Button>}
    {props.next && <Button onClick={props.next} className="float-right m-2" color="link" disabled={!props.nextEnabled}>Next &gt;</Button>}
  </footer>
);

Footer.propTypes = {
  previous: PropTypes.func,
  next: PropTypes.func,
  nextEnabled: PropTypes.bool
};

const withFooterHoC = (WrappedComponent, wizard) => {
  class HOC extends Component {
    constructor(props) {
      super(props);
      this.state = {
        nextEnabled: false
      };
    }

    enableNext = () => {
      this.setState({ nextEnabled: true });
    }

    render() {
      return (
        <React.Fragment>
          <WrappedComponent wizard={wizard} enableNext={this.enableNext} />
          <Footer next={wizard.next} nextEnabled={this.state.nextEnabled}/>
        </React.Fragment>
      );
    }
  }
    
  return HOC;
};

export default withFooterHoC;
