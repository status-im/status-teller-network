import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, withRouter } from "react-router-dom";

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
  
  next = () => {
    let currentStep = this.state.currentStep;
    const stepsLength = this.props.steps.length;

    if (currentStep >= stepsLength - 1) {
      return;
    }

    currentStep = currentStep + 1;
    this.setState({
      currentStep: currentStep
    });
    this.props.history.push(this.props.steps[currentStep].path);
  }

  prev = () => {
    let currentStep = this.state.currentStep;
    
    if (currentStep <= 0) {
      return;
    }
    
    currentStep = currentStep - 1;
    this.setState({
      currentStep: currentStep
    });
    this.props.history.push(this.props.steps[currentStep].path);
  }

  renderSteps() {
    return this.props.steps.map((step, index) => (
      <Route key={index} path={step.path} component = {() => step.render(this)}/>
    ));
  }
  
  render() {
    return(
      <Switch location={this.props.location}>
        {this.renderSteps()}
        <Redirect from={this.props.path} exact to={this.props.steps[0].path} />
      </Switch>
    );
  }
}

Wizard.propTypes = {
  location: PropTypes.object,
  path: PropTypes.string,
  history: PropTypes.object,
  steps: PropTypes.arrayOf(PropTypes.object)
};

export default withRouter(Wizard);
