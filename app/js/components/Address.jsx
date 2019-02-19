import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compactAddress} from "../utils/address";

class Address extends Component {
  constructor(props) {
    super(props);
    this.state = {addressHovered: false};
  }

  mouseOverAddress = () => {
    this.setState({addressHovered: true});
  };

  mouseOutAddress = () => {
    this.setState({addressHovered: false});
  };

  render() {
    return (<span title={this.props.address} onMouseOver={this.mouseOverAddress}
                  onMouseOut={this.mouseOutAddress}>{this.props.compact || !this.state.addressHovered ? compactAddress(this.props.address) : this.props.address}
    </span>);
  }
}

Address.defaultProps = {
  compact: false
};

Address.propTypes = {
  address: PropTypes.string,
  compact: PropTypes.bool
};

export default Address;
