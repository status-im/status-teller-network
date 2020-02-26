import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

import './withFooter.scss';

const Footer = (props) => {
  if (!props.visible) {
    return null;
  }
  return (<footer className="footer">
    {props.wizard.canNext() &&
    <Button onClick={props.next} color="primary" disabled={!props.nextEnabled}>
      {props.nextLabel} →
    </Button>}
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
      this.beforeChangeHandler = null;
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

    async executeBeforePageChange() {
      if (!this.beforeChangeHandler) {
        return;
      }
      return new Promise((resolve) => {
        this.beforeChangeHandler(resolve);
        this.beforeChangeHandler = null;
      });
    }

    next = async () => {
      await this.executeBeforePageChange();
      this.executeChanges();
      this.executeNexts();
      wizard.next();

    };

    previous = async () => {
      await this.executeBeforePageChange();
      this.executeChanges();
      wizard.previous();
    };

    onPageChange = (cb) => {
      this.changeSubs.push(cb);
    };

    beforePageChange = (cb) => {
      if (this.beforeChangeHandler) {
        console.warn('A beforePageChange handler was already defined. It will be overwritten, make sure you know what you are doing.');
      }
      this.beforeChangeHandler = cb;
    };

    onNext = (cb) => {
      this.nextSubs.push(cb);
    };

    render() {
      const controller = {
        enableNext: this.enableNext,
        disableNext: this.disableNext,
        onPageChange: this.onPageChange,
        beforePageChange: this.beforePageChange,
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
