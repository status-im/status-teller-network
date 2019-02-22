import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import SellerPaymentMethod from './components/SellerPaymentMethod';
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";
import { PAYMENT_METHODS } from '../../../features/metadata/constants';

class SellerPaymentMethodsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMethods: props.seller.paymentMethods,
      ready: false
    };
    this.validate(props.seller.paymentMethods);
    props.footer.onPageChange(() => {
      props.setPaymentMethods(this.state.selectedMethods);
    });
  }

  componentDidMount() {
    if (!this.props.seller.location) {
      this.props.wizard.previous();
    } else {
      this.setState({ready: true});
    }
  }

  validate(selectedMethods) {
    if (selectedMethods.length) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  togglePaymentMethod = (selectedMethod) => {
    const selectedMethods = Object.assign([], this.state.selectedMethods);
    const idx = selectedMethods.indexOf(selectedMethod);
    if (idx > -1) {
      selectedMethods.splice(idx, 1);
    } else {
      selectedMethods.push(selectedMethod);
    }
    this.setState({selectedMethods});
    this.validate(selectedMethods);
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    return (
      <SellerPaymentMethod methods={PAYMENT_METHODS} togglePaymentMethod={this.togglePaymentMethod}
                           selectedMethods={this.state.selectedMethods}/>
    );
  }
}

SellerPaymentMethodsContainer.propTypes = {
  wizard: PropTypes.object,
  footer: PropTypes.object,
  seller: PropTypes.object,
  setPaymentMethods: PropTypes.func
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state)
});

export default connect(
  mapStateToProps,
  {
    setPaymentMethods: newSeller.actions.setPaymentMethods
  }
)(SellerPaymentMethodsContainer);
