import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import IncludeSignatureForm from '../components/IncludeSignatureForm';
import PropTypes from 'prop-types';
import signature from '../features/signature';

class SignatureContainer extends Component {
  includeSignature = (signature) => {
    this.props.includeSignature(signature);
  };

  render() {
    return <Fragment>
      <IncludeSignatureForm onSubmit={this.includeSignature} result={this.props.receipt} error={this.props.error} />
    </Fragment>;
  }
}

SignatureContainer.propTypes = {
  includeSignature: PropTypes.func,
  error: PropTypes.string,
  receipt: PropTypes.object
};

const mapStateToProps = state => ({
  error: signature.selectors.error(state),
  receipt: signature.selectors.receipt(state)
});

export default connect(
  mapStateToProps,
  {
    includeSignature: signature.actions.includeSignature
  }
)(SignatureContainer);
