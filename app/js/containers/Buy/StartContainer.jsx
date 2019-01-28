import React, {Component} from 'react';
import PropTypes from 'prop-types';

class BuyStartContainer extends Component {
  render() {
    return (
      <React.Fragment>
        <p>Buy start</p>;
        <a onClick={this.props.wizard.next}>Next</a>
      </React.Fragment>
    );
  }
}

BuyStartContainer.propTypes = {
  wizard: PropTypes.object
};


export default BuyStartContainer;
