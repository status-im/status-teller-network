import React from 'react';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';
import {Alert} from "reactstrap";

const TransactionHash = ({txHash, t}) => (
  <Alert color="info">{t('transaction.hash')}:&nbsp;
    <a href={"https://etherscan.io/tx/" + txHash} rel="noopener noreferrer" target="_blank">{txHash}</a>
  </Alert>
);

TransactionHash.propTypes = {
  txHash: PropTypes.string,
  t: PropTypes.func
};

export default withNamespaces()(TransactionHash);
