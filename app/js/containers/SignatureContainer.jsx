import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import IncludeSignatureForm from '../components/IncludeSignatureForm';
import PropTypes from 'prop-types';
import escrow from '../features/escrow';

class SignatureContainer extends Component {
  includeSignature = (signedMessage) => {
    this.props.includeSignature(signedMessage);
  };

  render() {
    return <Fragment>
      <IncludeSignatureForm onSubmit={this.includeSignature} result={this.props.escrowReceipt} error={this.props.escrowError} />
    </Fragment>;
  }
}

SignatureContainer.propTypes = {
  includeSignature: PropTypes.func,
  escrowError: PropTypes.string,
  escrowReceipt: PropTypes.object
};

const mapStateToProps = state => ({
  escrowError: escrow.selectors.error(state),
  escrowReceipt: escrow.selectors.receipt(state)
});

export default connect(
  mapStateToProps,
  {
    includeSignature: escrow.actions.includeSignature
  }
)(SignatureContainer);
