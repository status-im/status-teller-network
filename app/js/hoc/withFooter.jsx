import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

import './withFooter.scss';

const Footer = (props) => (
  <footer className="footer">
    {props.wizard.canPrevious() &&
    <Button onClick={props.previous} className="m-2" color="link">&lt; Previous</Button>}
    {props.wizard.canNext() &&
    <Button onClick={props.next} className="float-right m-2" color="link"
            disabled={!props.nextEnabled}>Next &gt;</Button>}
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
      this.changeSubs = [];
    }

    enableNext = () => {
      this.setState({nextEnabled: true});
    };

    disableNext = () => {
      this.setState({nextEnabled: false});
    };

    change() {
      this.changeSubs.forEach(cb => {
        cb.call(cb);
      });
      this.changeSubs = [];
    }

    next = () => {
      this.change();
      wizard.next();

    };

    previous = () => {
      this.change();
      wizard.previous();
    };

    onPageChange = (cb) => {
      this.changeSubs.push(cb);
    };

    render() {
      const controller = {
        enableNext: this.enableNext,
        disableNext: this.disableNext,
        onPageChange: this.onPageChange
      };
      return (
        <div className="wizard-container">
          <WrappedComponent wizard={wizard} footer={controller}/>
          <Footer wizard={wizard} next={this.next} previous={this.previous}
                  nextEnabled={this.state.nextEnabled}/>
        </div>
      );
    }
  }

  return HOC;
};

export default withFooterHoC;
