import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import LimitForm from './components/LimitForm';
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";
import {withRouter} from "react-router-dom";
import "./index.scss";

class Limits extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limitL: props.seller.limitL,
      limitU: props.seller.limitU,
      useCustomLimits: props.seller.useCustomLimits,
      ready: false
    };
    this.validate(props.seller.useCustomLimits, props.seller.limitL, props.seller.limitU);
  }

  componentDidMount() {
    if (isNaN(this.props.seller.margin)) {
      return this.props.wizard.previous();
    }
    this.setState({ready: true});
    this.props.footer.onPageChange(() => {
      this.props.setLimits(this.state.useCustomLimits, this.state.limitL || 0, this.state.limitU || 0);
    });
  }

  validate(useCustomLimits, limitL, limitU) {
    limitL = limitL || 0;
    limitU = limitU || 0;

    if (useCustomLimits) {
      if ((limitL > limitU) || (limitL === 0 && limitU === 0)) {
        return this.props.footer.disableNext();
      }
    }
    this.props.footer.enableNext();
  }

  customLimitsChange = (useCustomLimits) => {
    this.setState({useCustomLimits}, () => {
      this.validate(useCustomLimits, this.state.limitL, this.state.limitU);
    });
  };

  limitChange = (limitL, limitU) => {
    limitL = parseInt(limitL, 10);
    if (isNaN(limitL)) {
      limitL = '';
    }
    limitU = parseInt(limitU, 10);
    if (isNaN(limitU)) {
      limitU = '';
    }
    this.validate(this.state.useCustomLimits, limitL, limitU);
    this.setState({limitL, limitU});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    return <LimitForm limitL={this.state.limitL}
                      limitU={this.state.limitU}
                      currency={this.props.seller.currency}
                      useCustomLimits={this.state.useCustomLimits}
                      customLimitsChange={this.customLimitsChange}
                      limitChange={this.limitChange}/>;

  }
}

Limits.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  setLimits: PropTypes.func,
  seller: PropTypes.object,
  token: PropTypes.object,
  wizard: PropTypes.object,
  footer: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state)
});

export default connect(
  mapStateToProps,
  {
    setLimits: newSeller.actions.setLimits
  }
)(withRouter(Limits));
