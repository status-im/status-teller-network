import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, withRouter } from "react-router-dom";
import Footer from "../components/Footer";

class Wizard extends Component {
  constructor(props) {
    super(props);

    let currentStep = this.getCurrentStep(location);

    let isActive = true;
    if (currentStep === -1) {
      currentStep = 0;
      isActive = false;
    }

    this.state = {
      currentStep,
      isActive
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      let currentStep = this.getCurrentStep(location);

      let isActive = true;
      if (currentStep === -1) {
        currentStep = 0;
        isActive = false;
      }

      this.setState({
        currentStep,
        isActive
      });
    }
  }

  getCurrentStep(location) {
    return this.props.steps.findIndex((step) => location.hash.endsWith(step.path));
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
  };

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
  };

  renderSteps() {
    return this.props.steps.map((step, index) => (
      <Route key={index} path={step.path} component = {() => step.render(this)}/>
    ));
  }
  
  render() {
    return(
      <Fragment>
        <Switch location={this.props.location}>
          {this.renderSteps()}
          <Redirect from={this.props.path} exact to={this.props.steps[0].path} />
        </Switch>
        {this.state.isActive && <Footer next={(this.state.currentStep < this.props.steps.length - 1) ? this.next : null}
                previous={(this.state.currentStep > 0) ? this.prev : null}/>}
      </Fragment>

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
