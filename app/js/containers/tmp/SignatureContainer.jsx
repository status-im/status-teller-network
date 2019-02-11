import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import IncludeSignatureForm from '../../components/tmp/IncludeSignatureForm';
import signature from '../../features/signature';

class SignatureContainer extends Component {
  includeSignature = (signature) => {
    this.props.includeSignature(signature);
  };

  render() {
    return <IncludeSignatureForm onSubmit={this.includeSignature} receipt={this.props.receipt} error={this.props.error}
                                 loading={this.props.loading} txHash={this.props.txHash}/>;
  }
}

SignatureContainer.propTypes = {
  includeSignature: PropTypes.func,
  error: PropTypes.string,
  txHash: PropTypes.string,
  loading: PropTypes.bool,
  receipt: PropTypes.object
};

const mapStateToProps = state => ({
  error: signature.selectors.error(state),
  receipt: signature.selectors.receipt(state),
  txHash: signature.selectors.txHash(state),
  loading: signature.selectors.loading(state)
});

export default connect(
  mapStateToProps,
  {
    includeSignature: signature.actions.includeSignature
  }
)(SignatureContainer);
