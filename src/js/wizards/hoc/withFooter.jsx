import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

import arrow from '../../../images/arrow.svg';
import arrowDisabled from '../../../images/arrow-disabled.svg';

import './withFooter.scss';

const Footer = (props) => {
  if (!props.visible) {
    return null;
  }
  return (<footer className="footer">
    {props.wizard.canPrevious() &&
    <Button onClick={props.previous} className="m-2 p-1" color="link"><img className="fa-rotate-180 footer-arrow mr-2" src={arrow} alt="previous arrow"/> Previous</Button>}
    {props.wizard.canNext() &&
    <Button onClick={props.next} className="float-right m-2 p-1" color="link"
            disabled={!props.nextEnabled}>{props.nextLabel} <img  className="footer-arrow ml-2" src={props.nextEnabled ? arrow : arrowDisabled} alt="next arrow"/></Button>}
  </footer>);
};

Footer.defaultProps = {
  nextLabel: 'Next'
};

Footer.propTypes = {
  nextLabel: PropTypes.string,
  wizard: PropTypes.object,
  nextEnabled: PropTypes.bool,
  previous: PropTypes.func,
  next: PropTypes.func,
  visible: PropTypes.bool
};

const withFooterHoC = (WrappedComponent, nextLabel, wizard) => {
  class FooterHoC extends Component {
    constructor(props) {
      super(props);
      this.state = {
        nextEnabled: false,
        visible: true
      };
      this.changeSubs = [];
      this.nextSubs = [];
    }

    enableNext = () => {
      this.setState({nextEnabled: true});
    };

    disableNext = () => {
      this.setState({nextEnabled: false});
    };

    hide = () => {
      this.setState({visible: false});
    };

    show = () => {
      this.setState({visible: true});
    };

    executeChanges() {
      this.changeSubs.forEach(cb => {
        cb.call(cb);
      });
      this.changeSubs = [];
    }

    executeNexts() {
      this.nextSubs.forEach(cb => cb());
      this.nextSubs = [];
    }

    next = () => {
      this.executeChanges();
      this.executeNexts();
      wizard.next();

    };

    previous = () => {
      this.executeChanges();
      wizard.previous();
    };

    onPageChange = (cb) => {
      this.changeSubs.push(cb);
    };

    onNext = (cb) => {
      this.nextSubs.push(cb);
    };

    render() {
      const controller = {
        enableNext: this.enableNext,
        disableNext: this.disableNext,
        onPageChange: this.onPageChange,
        onNext: this.onNext,
        show: this.show,
        hide: this.hide
      };
      return (
        <div className="wizard-container">
          <WrappedComponent wizard={wizard} footer={controller}/>
          <Footer wizard={wizard}
                  next={this.next}
                  previous={this.previous}
                  nextEnabled={this.state.nextEnabled}
                  nextLabel={nextLabel}
                  visible={this.state.visible}/>
        </div>
      );
    }
  }

  return FooterHoC;
};

export default withFooterHoC;
