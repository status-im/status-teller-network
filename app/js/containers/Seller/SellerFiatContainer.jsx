import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import FiatSelectorForm from "../../components/Seller/FiatSelectorForm";
import seller from '../../features/seller';
import {connect} from 'react-redux';

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

class SellerFiatContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fiat: props.fiat
    };
    this.validate(props.fiat);
    this.props.footer.onPageChange(() => {
      props.setFiatCurrency(this.state.fiat);
    });
  }

  validate(fiat) {
    if (!fiat.id) {
      return this.props.footer.disableNext();
    }
    this.props.footer.enableNext();
  }

  changeFiat = (fiat) => {
    if (!fiat) {
      fiat = {};
    }
    this.validate(fiat);
    this.setState({fiat});
  };

  render() {
    return (<FiatSelectorForm value={this.state.fiat} currencies={CURRENCY_DATA}
                              changeFiat={this.changeFiat}/>);
  }
}

SellerFiatContainer.propTypes = {
  t: PropTypes.func,
  setFiatCurrency: PropTypes.func,
  fiat: PropTypes.object,
  footer: PropTypes.object
};

const mapStateToProps = state => ({
  fiat: seller.selectors.fiat(state)
});

export default connect(
  mapStateToProps,
  {
    setFiatCurrency: seller.actions.setFiatCurrency
  }
)(withNamespaces()(SellerFiatContainer));
