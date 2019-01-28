import React, {Component} from 'react';
import PropTypes from 'prop-types';

class BuyPaymentTypeContainer extends Component {
  render() {
    return (
      <div>
        <p>Buy payment type</p>;
        <a onClick={this.props.wizard.prev}>Prev</a>
      </div>
    );
  }
}

BuyPaymentTypeContainer.propTypes = {
  wizard: PropTypes.object
};


export default BuyPaymentTypeContainer;
