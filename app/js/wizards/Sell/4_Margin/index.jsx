import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import MarginSelectorForm from './components/MarginSelectorForm';
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";
import network from '../../../features/network';
import prices from '../../../features/prices';

class SellerMarginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      margin: props.seller.margin,
      marketType: props.seller.marketType,
      ready: false
    };
    this.validate(props.seller.margin);
    props.footer.onPageChange(() => {
      props.setMargin(this.state.margin, this.state.marketType);
    });
  }

  componentDidMount() {
    if (!this.props.seller.currency) {
      this.props.wizard.previous();
    } else {
      this.setState({ready: true});
    }
  }

  validate(margin) {
    if ((margin || margin === 0) && margin < 100) {
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

  marketTypeChange = (marketType) => {
    this.setState({marketType});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    return (
      <MarginSelectorForm token={this.props.token}
                          prices={this.props.prices}
                          currency={this.props.seller.currency}
                          margin={this.state.margin}
                          marginChange={this.marginChange}
                          marketType={this.state.marketType}
                          marketTypeChange={this.marketTypeChange}/>);
  }
}

SellerMarginContainer.propTypes = {
  t: PropTypes.func,
  prices: PropTypes.object,
  setMargin: PropTypes.func,
  seller: PropTypes.object,
  token: PropTypes.object,
  wizard: PropTypes.object,
  footer: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  token: network.selectors.getTokenByAddress(state, newSeller.selectors.getNewSeller(state).asset),
  prices: prices.selectors.getPrices(state)
});

export default connect(
  mapStateToProps,
  {
    setMargin: newSeller.actions.setMargin
  }
)(SellerMarginContainer);
