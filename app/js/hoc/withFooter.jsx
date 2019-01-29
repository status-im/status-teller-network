import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

import './withFooter.scss';

const Footer = (props) => (
  <footer className="container">
    {props.wizard.canPrevious() && 
      <Button onClick={props.wizard.previous} className="m-2" color="link">&lt; Previous</Button>}
    {props.wizard.canNext() && 
      <Button onClick={props.wizard.next} className="float-right m-2" color="link" disabled={!props.nextEnabled}>Next &gt;</Button>}
  </footer>
);

Footer.propTypes = {
  wizard: PropTypes.object,
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

    disableNext = () => {
      this.setState({ nextEnabled: false });
    }

    render() {
      const controller = {
        enableNext: this.enableNext,
        disableNext: this.disableNext
      };
      return (
        <React.Fragment>
          <WrappedComponent wizard={wizard} footer={controller} />
          <Footer wizard={wizard}
                  nextEnabled={this.state.nextEnabled}/>
        </React.Fragment>
      );
    }
  }
    
  return HOC;
};

export default withFooterHoC;
