import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

import './withFooter.scss';

const Footer = (props) => (
  <footer className="container">
    {props.wizard.canPrevious() &&
      <Button onClick={props.previous} className="m-2" color="link">&lt; Previous</Button>}
    {props.wizard.canNext() &&
      <Button onClick={props.next} className="float-right m-2" color="link" disabled={!props.nextEnabled}>Next &gt;</Button>}
  </footer>
);

Footer.propTypes = {
  wizard: PropTypes.object,
  nextEnabled: PropTypes.bool,
  previous: PropTypes.func,
  next: PropTypes.func
};

const withFooterHoC = (WrappedComponent, wizard) => {
  class HOC extends Component {
    constructor(props) {
      super(props);
      this.state = {
        nextEnabled: false
      };
      this.nextSubs = [];
    }

    enableNext = () => {
      this.setState({ nextEnabled: true });
    };

    disableNext = () => {
      this.setState({ nextEnabled: false });
    };

    next = () => {
     wizard.next();
     this.nextSubs.forEach(cb => {
       cb.call(cb);
     });
     this.nextSubs = [];
    };

    previous = () => {
     wizard.previous();
    };

    onNext = (cb) => {
      this.nextSubs.push(cb);
    };

    render() {
      const controller = {
        enableNext: this.enableNext,
        disableNext: this.disableNext,
        onNext: this.onNext
      };
      return (
        <React.Fragment>
          <WrappedComponent wizard={wizard} footer={controller} />
          <Footer wizard={wizard} next={this.next} previous={this.previous}
                  nextEnabled={this.state.nextEnabled}/>
        </React.Fragment>
      );
    }
  }

  return HOC;
};

export default withFooterHoC;
