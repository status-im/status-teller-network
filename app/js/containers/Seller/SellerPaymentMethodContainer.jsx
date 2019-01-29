import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerPaymentMethod from '../../components/Seller/SellerPaymentMethod';

const methods = ['Cash (In person)', 'Bank Transfer', 'International wire'];

class SellerPaymentMethodContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMethods: []
    };
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
    if (selectedMethods.length) {
      this.props.footer.enableNext();
    }
    // TODO Save selected asset;
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
  footer: PropTypes.object
};


export default SellerPaymentMethodContainer;
