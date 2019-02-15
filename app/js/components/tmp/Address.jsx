import React from 'react';
import PropTypes from 'prop-types';
import {compactAddress} from "../../utils/address";

const Address = (props) => <span title={props.address}>{props.compact ? compactAddress(props.address) : props.address}</span>;

Address.defaultProps = {
  compact: false
};

Address.propTypes = {
  address: PropTypes.string,
  compact: PropTypes.bool
};

export default Address;
