import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import license from '../features/license';
import escrow from '../features/escrow';
import License from '../components/License';
import CreateEscrowForm from '../components/CreateEscrowForm';
import PropTypes from 'prop-types';
import EscrowList from "../components/EscrowList";

class EscrowsContainer extends Component {
  componentDidMount() {
    this.props.checkLicenseOwner();
    this.props.checkUserRating();
    this.props.getEscrows();
  }

  buyLicense = () => {
    this.props.buyLicense();
  };

  createEscrow = (buyer, value, expiration) => {
    this.props.createEscrow(buyer, value, expiration);
  };

  render() {
    const {error, userRating, isLicenseOwner} = this.props;
    return <Fragment>
      <License buyLicense={this.buyLicense} isLicenseOwner={isLicenseOwner} userRating={userRating} error={error}/>

      {isLicenseOwner &&
      <CreateEscrowForm create={this.createEscrow} result={this.props.escrowReceipt} error={this.props.escrowError}/>}

      <EscrowList escrows={this.props.escrows} releaseEscrow={this.props.releaseEscrow}
                  openCase={this.props.openCase} payEscrow={this.props.payEscrow}
                  signatureDialog={this.props.signatureDialog}
                  payEscrowSignature={this.props.payEscrowSignature}
                  openCaseSignature={this.props.openCaseSignature}
                  closeDialog={this.props.closeDialog}
                  cancelEscrow={this.props.cancelEscrow} error={this.props.errorGet} loading={this.props.escrowsLoading}
                  rateTransaction={this.props.rateTransaction}/>
    </Fragment>;
  }
}

EscrowsContainer.propTypes = {
  checkLicenseOwner: PropTypes.func,
  checkUserRating: PropTypes.func,
  buyLicense: PropTypes.func,
  createEscrow: PropTypes.func,
  releaseEscrow: PropTypes.func,
  payEscrow: PropTypes.func,
  payEscrowSignature: PropTypes.func,
  openCase: PropTypes.func,
  openCaseSignature: PropTypes.func,
  closeDialog: PropTypes.func,
  cancelEscrow: PropTypes.func,
  rateTransaction: PropTypes.func,
  getEscrows: PropTypes.func,
  escrows: PropTypes.array,
  signatureDialog: PropTypes.object,
  escrowsLoading: PropTypes.bool,
  errorGet: PropTypes.string,
  error: PropTypes.string,
  userRating: PropTypes.number,
  isLicenseOwner: PropTypes.bool,
  escrowError: PropTypes.string,
  escrowReceipt: PropTypes.object
};

const mapStateToProps = state => ({
  isLicenseOwner: license.selectors.isLicenseOwner(state),
  userRating: license.selectors.userRating(state),
  error: license.selectors.error(state),
  escrowError: escrow.selectors.error(state),
  escrowReceipt: escrow.selectors.receipt(state),
  errorGet: escrow.selectors.errorGet(state),
  escrowsLoading: escrow.selectors.loading(state),
  escrows: escrow.selectors.escrows(state),
  signatureDialog: escrow.selectors.signatureDialog(state)
});

export default connect(
  mapStateToProps,
  {
    buyLicense: license.actions.buyLicense,
    createEscrow: escrow.actions.createEscrow,
    getEscrows: escrow.actions.getEscrows,
    payEscrow: escrow.actions.payEscrow,
    payEscrowSignature: escrow.actions.payEscrowSignature,
    openCase: escrow.actions.openCase,
    openCaseSignature: escrow.actions.openCaseSignature,
    releaseEscrow: escrow.actions.releaseEscrow,
    cancelEscrow: escrow.actions.cancelEscrow,
    rateTransaction: escrow.actions.rateTransaction,
    checkLicenseOwner: license.actions.checkLicenseOwner,
    checkUserRating: license.actions.checkUserRating,
    closeDialog: escrow.actions.closeDialog
  }
)(EscrowsContainer);
