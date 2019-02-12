import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import SellerPaymentMethod from '../../components/Seller/SellerPaymentMethod';
import newSeller from "../../features/newSeller";

const methods = ['Cash (In person)', 'Bank Transfer', 'International wire'];

class SellerPaymentMethodsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMethods: props.seller.paymentMethods
    };
    this.validate(props.seller.paymentMethods);
    props.footer.onPageChange(() => {
      props.setPaymentMethods(this.state.selectedMethods);
    });
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
    return (
      <SellerPaymentMethod methods={methods} togglePaymentMethod={this.togglePaymentMethod}
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
