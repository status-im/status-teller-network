import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerPaymentMethod from '../../components/Seller/SellerPaymentMethod';
import seller from "../../features/seller";
import {connect} from "react-redux";

const methods = ['Cash (In person)', 'Bank Transfer', 'International wire'];

class SellerPaymentMethodContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMethods: props.paymentMethods
    };
    this.validate(props.paymentMethods);
    this.props.footer.onPageChange(() => {
      props.setPaymentMethods(this.state.selectedMethods);
    });
  }

  validate(selectedMethods) {
    if (selectedMethods.length) {
      this.props.footer.enableNext();
    } else {
      this.props.footer.disableNext();
    }
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
      <Fragment>
        <SellerPaymentMethod methods={methods} togglePaymentMethod={this.togglePaymentMethod} selectedMethods={this.state.selectedMethods}/>
      </Fragment>
    );
  }
}

SellerPaymentMethodContainer.propTypes = {
  wizard: PropTypes.object,
  footer: PropTypes.object,
  paymentMethods: PropTypes.array,
  setPaymentMethods: PropTypes.func
};


const mapStateToProps = state => ({
  paymentMethods: seller.selectors.paymentMethods(state)
});

export default connect(
  mapStateToProps,
  {
    setPaymentMethods: seller.actions.setPaymentMethods
  }
)(SellerPaymentMethodContainer);
