import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import {connect} from 'react-redux';

import FiatSelectorForm from "./components/FiatSelectorForm";
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";

// TODO: where will this FIAT currency list come from?
//       cryptocompare does not identify which currencies are FIAT
//       and it does not have a full list of FIAT currencies
const CURRENCY_DATA = [
  {id: 'USD', label: 'United States Dollar - USD'},
  {id: 'EUR', label: 'Euro - EUR'},
  {id: 'GBP', label: 'Pound sterling - GBP'},
  {id: 'JPY', label: 'Japanese Yen - JPY'},
  {id: 'CNY', label: 'Chinese Yuan - CNY'},
  {id: 'KRW', label: 'South Korean Won - KRW'}
];

class SellerCurrencyContainer extends Component {
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
      this.props.wizard.previous();
    } else {
      this.setState({ready: true});
    }
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
                              currencies={CURRENCY_DATA}
                              changeCurrency={this.changeCurrency}/>);
  }
}

SellerCurrencyContainer.propTypes = {
  t: PropTypes.func,
  wizard: PropTypes.object,
  setCurrency: PropTypes.func,
  seller: PropTypes.object,
  footer: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state)
});

export default connect(
  mapStateToProps,
  {
    setCurrency: newSeller.actions.setCurrency
  }
)(withNamespaces()(SellerCurrencyContainer));
