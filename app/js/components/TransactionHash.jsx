import React from 'react';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';

const TransactionHash = ({txHash, t}) => (
  <p>{t('transaction.hash')}:&nbsp;
    <a href={"https://etherscan.io/tx/" + txHash} rel="noopener noreferrer" target="_blank">{txHash}</a>
  </p>
);

TransactionHash.propTypes = {
  txHash: PropTypes.func,
  t: PropTypes.string
};

export default withNamespaces()(TransactionHash);
