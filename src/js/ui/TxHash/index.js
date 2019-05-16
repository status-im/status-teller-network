import React from "react";
import PropTypes from 'prop-types';
import network from "../../features/network";
import {connect} from "react-redux";

const etherScanUrls = {
  1: 'https://etherscan.io/tx/',
  3: 'https://ropsten.etherscan.io/tx/',
  4: 'https://rinkeby.etherscan.io/tx/',
  5: 'https://goerli.etherscan.io/tx/',
  42: 'https://kovan.etherscan.io/tx/',
  401697: 'https://tobalaba.etherscan.com/tx/'
};

const TxHash = ({value, network}) => {
  if (!network || (!network.id && network.id !== 0) || !etherScanUrls[network.id]) {
    return value;
  }

  return (<a href={etherScanUrls[network.id] + value} target="_blank" rel="noopener noreferrer">{value}</a>);
};

TxHash.propTypes = {
  value: PropTypes.string,
  network: PropTypes.object
};

const mapStateToProps = state => ({
  network: network.selectors.getNetwork(state)
});

export default connect(
  mapStateToProps
)(TxHash);
