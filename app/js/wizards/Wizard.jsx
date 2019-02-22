import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, withRouter } from "react-router-dom";

import withFooterHoC from './hoc/withFooter';

class Wizard extends Component {
  constructor(props) {
    super(props);
    let currentStep = props.steps.findIndex((step) => location.hash.endsWith(step.path));

    if (currentStep === -1) {
      currentStep = 0;
    }

    this.state = {
      currentStep
    };
  }

  canNext = () => {
    let currentStep = this.state.currentStep;
    const stepsLength = this.props.steps.length;
    return currentStep <= stepsLength - 1;
  };

  lastStep() {
    return this.state.currentStep === this.props.steps.length - 1;
  }

  next = () => {
    if (!this.canNext() || this.lastStep()) {
      return;
    }

    let currentStep = this.state.currentStep;
    currentStep = currentStep + 1;
    this.setState({
      currentStep: currentStep
    });
    this.props.history.push(this.props.steps[currentStep].path);
  };

  canPrevious = () => {
    return this.state.currentStep > 0;
  };

  previous = () => {
    if (!this.canPrevious()) {
      return;
    }

    let currentStep = this.state.currentStep;
    currentStep = currentStep - 1;
    this.setState({
      currentStep: currentStep
    });
    this.props.history.push(this.props.steps[currentStep].path);
  };

  renderSteps() {
    return this.props.steps.map((step, index) => {
      return <Route key={index} path={step.path} component={withFooterHoC(step.component, step.nextLabel, this)}/>;
    });
  }

  render() {
    return (
      <Switch location={this.props.location}>
        {this.renderSteps()}
        <Redirect from={this.props.path} exact to={this.props.steps[0].path}/>
      </Switch>
    );
  }
}

Wizard.propTypes = {
  location: PropTypes.object,
  path: PropTypes.string,
  history: PropTypes.object,
  steps: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default withRouter(Wizard);
