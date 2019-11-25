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
    if(this.props.disableHover) return;
    this.setState({addressHovered: true});
  };

  mouseOutAddress = () => {
    this.setState({addressHovered: false});
  };

  handleClick = () => {
    this.setState({fixed: !this.state.fixed});
  };

  render() {
    if (!this.props.address) {
      return null;
    }
    const address = this.props.compact || (!this.state.fixed &&  !this.state.addressHovered) ? compactAddress(this.props.address, this.props.length) : this.props.address;
    return (<span className="addr clickable" title={this.props.address} onClick={this.handleClick} onMouseOver={this.mouseOverAddress}
                  onMouseOut={this.mouseOutAddress}>{address}
    </span>);
  }
}

Address.defaultProps = {
  compact: false,
  length: 4,
  disableHover: false
};

Address.propTypes = {
  address: PropTypes.string,
  compact: PropTypes.bool,
  length: PropTypes.number,
  disableHover: PropTypes.bool
};

export default Address;
