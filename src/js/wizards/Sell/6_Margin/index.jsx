import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import MarginSelectorForm from './components/MarginSelectorForm';
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";
import network from '../../../features/network';
import escrow from '../../../features/escrow';
import prices from '../../../features/prices';
import {withRouter} from "react-router-dom";

import "./index.scss";

class Margin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      margin: props.seller.margin,
      ready: false
    };
    props.getFeeMilliPercent();

    props.footer.onPageChange(() => {
      props.setMargin(this.state.margin);
    });
  }

  componentDidMount() {
    if (!this.props.seller.arbitrator) {
      return this.props.wizard.previous();
    }
    this.validate(this.props.seller.margin);
    this.setState({ready: true});
  }

  validate(margin) {
    if ((margin || margin === 0) && margin <= 100 && margin > -100) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  marginChange = (margin) => {
    margin = parseInt(margin, 10);
    if (isNaN(margin)) {
      margin = '';
    }
    this.validate(margin);
    this.setState({margin});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    return <MarginSelectorForm token={this.props.token}
                               prices={this.props.prices}
                               currency={this.props.seller.currency}
                               margin={this.state.margin}
                               marginChange={this.marginChange}
                               feeMilliPercent={this.props.feeMilliPercent} />;

  }
}

Margin.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  prices: PropTypes.object,
  setMargin: PropTypes.func,
  seller: PropTypes.object,
  token: PropTypes.object,
  wizard: PropTypes.object,
  footer: PropTypes.object,
  getFeeMilliPercent: PropTypes.func,
  feeMilliPercent: PropTypes.string
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  token: network.selectors.getTokenByAddress(state, newSeller.selectors.getNewSeller(state).asset),
  prices: prices.selectors.getPrices(state),
  feeMilliPercent: escrow.selectors.feeMilliPercent(state)
});

export default connect(
  mapStateToProps,
  {
    setMargin: newSeller.actions.setMargin,
    getFeeMilliPercent: escrow.actions.getFeeMilliPercent

  }
)(withRouter(Margin));
