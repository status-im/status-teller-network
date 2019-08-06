import React, {Component} from 'react';
import {ButtonGroup} from 'reactstrap';
import PropTypes from 'prop-types';

import CheckButton from '../../../../ui/CheckButton';
import { POPULAR_PAYMENT_METHODS_INDEXES, PAYMENT_METHODS } from '../../../../features/metadata/constants';

class SellerPaymentMethod extends Component {
  togglePaymentMethod(selectedMethod) {
    this.props.togglePaymentMethod(parseInt(selectedMethod, 10));
  }

  render() {
    return (
      <React.Fragment>
        <h2 className="mb-4">Payment methods that you want to accept</h2>
        <span className="text-muted text-small">Popular</span>
        <ButtonGroup vertical className="w-100">
          {POPULAR_PAYMENT_METHODS_INDEXES.map((idx) => (
            <CheckButton active={this.props.selectedMethods.indexOf(idx) > -1}
                         key={'method-' + idx} isCheckBox
                         onClick={(_e) => this.togglePaymentMethod(idx)}>
              {PAYMENT_METHODS[idx]}
            </CheckButton>
          ))}
        </ButtonGroup>

        <span className="text-muted text-small mt-3">All payment methods (A-Z)</span>
        <ButtonGroup vertical className="w-100">
          {Object.keys(PAYMENT_METHODS).filter(x => POPULAR_PAYMENT_METHODS_INDEXES.indexOf(x) === -1).map((idx) => (
            <CheckButton active={this.props.selectedMethods.indexOf(parseInt(idx, 10)) > -1}
                         key={'method-' + idx} isCheckBox
                         onClick={(_e) => this.togglePaymentMethod(idx)}>
             {PAYMENT_METHODS[idx]}
            </CheckButton>
          ))}
        </ButtonGroup>

        {this.props.selectedMethods.length === 0 && <p className="text-muted">Select one or more payment method to move to the next page</p>}
      </React.Fragment>
    );
  }
}

SellerPaymentMethod.propTypes = {
  togglePaymentMethod: PropTypes.func,
  selectedMethods: PropTypes.array
};


export default SellerPaymentMethod;
