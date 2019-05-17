import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compactAddress} from "../../utils/address";

import "./Address.scss";

class Address extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addressHovered: false,
      fixed: false
    };
  }

  mouseOverAddress = () => {
    this.setState({addressHovered: true});
  };

  mouseOutAddress = () => {
    this.setState({addressHovered: false});
  };

  handleClick = () => {
    this.setState({fixed: !this.state.fixed});
  }

  render() {
    if (!this.props.address) {
      return null;
    }
    const address = this.props.compact || (!this.state.fixed &&  !this.state.addressHovered) ? compactAddress(this.props.address, this.props.charLength) : this.props.address;
    return (<span className="addr" title={this.props.address} onClick={this.handleClick} onMouseOver={this.mouseOverAddress}
                  onMouseOut={this.mouseOutAddress}>{address}
    </span>);
  }
}

Address.defaultProps = {
  compact: false,
  charLength: 4
};

Address.propTypes = {
  address: PropTypes.string,
  compact: PropTypes.bool,
  charLength: PropTypes.number
};

export default Address;
