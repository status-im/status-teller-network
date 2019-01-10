import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import license from '../features/license';
import escrow from '../features/escrow';
import License from '../components/License';
import CreateEscrowForm from '../components/CreateEscrow';
import PropTypes from 'prop-types';

class LicenseContainer extends Component {
  componentDidMount() {
    this.props.checkLicenseOwner();
    this.props.checkUserRating();
  }

  buyLicense = () => {
    this.props.buyLicense();
  };

  rateTransaction = (rating) => {
    console.log('ok', rating);
  };

  createEscrow = (buyer, value, expiration) => {
    this.props.createEscrow(buyer, value, expiration);
  };

  render() {
    const {error, userRating, isLicenseOwner} = this.props;
    return <Fragment>
      <License buyLicense={this.buyLicense} isLicenseOwner={isLicenseOwner} userRating={userRating}
               error={error} rate={this.rateTransaction}/>

      <CreateEscrowForm create={this.createEscrow} result={this.props.escrowResult} error={this.props.escrowError}/>
    </Fragment>;
  }
}

LicenseContainer.propTypes = {
  checkLicenseOwner: PropTypes.func,
  checkUserRating: PropTypes.func,
  buyLicense: PropTypes.func,
  createEscrow: PropTypes.func,
  error: PropTypes.string,
  userRating: PropTypes.number,
  isLicenseOwner: PropTypes.bool,
  escrowError: PropTypes.string,
  escrowResult: PropTypes.object
};

const mapStateToProps = state => ({
  isLicenseOwner: license.selectors.isLicenseOwner(state),
  userRating: license.selectors.userRating(state),
  error: license.selectors.error(state),
  escrowError: escrow.selectors.error(state),
  escrowResult: escrow.selectors.result(state)
});

export default connect(
  mapStateToProps,
  {
    buyLicense: license.actions.buyLicense,
    createEscrow: escrow.actions.createEscrow,
    checkLicenseOwner: license.actions.checkLicenseOwner,
    checkUserRating: license.actions.checkUserRating
  }
)(LicenseContainer);
