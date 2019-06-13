import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import {connect} from 'react-redux';

import FiatSelectorForm from "./components/FiatSelectorForm";
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";
import {CURRENCY_DATA} from "../../../constants/currencies";

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
    if (!this.props.seller.arbitrator) {
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
                              currencies={CURRENCY_DATA.map(x => ({id: x.id, label: `${x.id} - ${x.label}. ${x.symbol}`}))}
                              changeCurrency={this.changeCurrency}/>);
  }
}

Currency.propTypes = {
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
)(withNamespaces()(Currency));
