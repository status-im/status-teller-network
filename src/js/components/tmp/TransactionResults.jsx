import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {Alert} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import TransactionHash from "./TransactionHash";

const TransactionResults = ({error, txHash, loading, loadingText, result, resultText, errorText}) => (
  <Fragment>
    {loading && <p><FontAwesomeIcon icon={faSpinner} spin/>{loadingText || 'Loading'}...</p>}
    {txHash && <TransactionHash txHash={txHash}/>}
    {error &&
    <Alert color="danger">{errorText || ''} {error}</Alert>}
    {result &&
    <Alert color="success">{resultText || ''}
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Alert>}
  </Fragment>
);

TransactionResults.propTypes = {
  txHash: PropTypes.string,
  error: PropTypes.string,
  resultText: PropTypes.string,
  loadingText: PropTypes.string,
  errorText: PropTypes.string,
  result: PropTypes.object,
  loading: PropTypes.bool,
  t: PropTypes.func
};

export default TransactionResults;
