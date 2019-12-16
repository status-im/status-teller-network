import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import prices from '../../../features/prices';
import FiatSelectorForm from "./components/FiatSelectorForm";
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";
import {CURRENCY_DATA} from "../../../constants/currencies";
import network from '../../../features/network';

class Currency extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: props.seller.currency,
      ready: false
    };
    this.validate(props.seller.currency);
    this.props.footer.onPageChange(() => {
      props.setCurrency(this.state.currency);
    });
  }

  componentDidMount() {
    if (!this.props.seller.paymentMethods.length) {
      return this.props.wizard.previous();
    }
    this.setState({ready: true});
  }

  validate(currency) {
    if (!currency) {
      return this.props.footer.disableNext();
    }
    this.props.footer.enableNext();
  }

  changeCurrency= (currency) => {
    if (!currency) {
      currency = '';
    }
    this.validate(currency);
    this.setState({currency});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    return (<FiatSelectorForm value={this.state.currency}
                              currencies={CURRENCY_DATA.filter(x => this.props.prices[this.props.token.symbol][x.id]).map(x => ({id: x.id, label: `${x.id} - ${x.label}. ${x.symbol}`}))}
                              changeCurrency={this.changeCurrency}/>);
  }
}

Currency.propTypes = {
  t: PropTypes.func,
  wizard: PropTypes.object,
  setCurrency: PropTypes.func,
  seller: PropTypes.object,
  footer: PropTypes.object,
  prices: PropTypes.object,
  token: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  prices: prices.selectors.getPrices(state),
  token: network.selectors.getTokenByAddress(state, newSeller.selectors.getNewSeller(state).asset),
});

export default connect(
  mapStateToProps,
  {
    setCurrency: newSeller.actions.setCurrency
  }
)(withTranslation()(Currency));
