import React, {Component} from 'react';
import {ButtonGroup} from 'reactstrap';
import PropTypes from 'prop-types';

import CheckButton from '../ui/CheckButton';

class SellerPaymentMethod extends Component {
  togglePaymentMethod(selectedMethod) {
    this.props.togglePaymentMethod(selectedMethod);
  }

  render() {
    return (
      <React.Fragment>
        <h2>Payment methods that you want to accept</h2>

        <ButtonGroup vertical className="w-100 mt-3">
          {this.props.methods.map((asset, idx) => (
            <CheckButton active={this.props.selectedMethods.indexOf(idx) > -1}
                         key={'asset-' + idx}
                         onClick={(_e) => this.togglePaymentMethod(idx)}>
              {asset}
            </CheckButton>
          ))}
        </ButtonGroup>

        {this.props.selectedMethods.length === 0 && <p className="text-info">Select one or more payment method to move to the next page</p>}
      </React.Fragment>
    );
  }
}

SellerPaymentMethod.propTypes = {
  methods: PropTypes.array,
  togglePaymentMethod: PropTypes.func,
  selectedMethods: PropTypes.array
};


export default SellerPaymentMethod;
