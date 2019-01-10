import React, {Component} from 'react';
import { connect } from 'react-redux';
import license from '../features/license';
import escrow from '../features/escrow';
import License from '../components/License';
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
    console.log(value, expiration);
    this.props.createEscrow(buyer, value, expiration);
  };

  render() {
    const {error, userRating, isLicenseOwner} = this.props;
    return <License buyLicense={this.buyLicense} isLicenseOwner={isLicenseOwner} userRating={userRating}
                    error={error} rate={this.rateTransaction} createEscrow={this.createEscrow} />;
  }
}

LicenseContainer.propTypes = {
  checkLicenseOwner: PropTypes.func,
  checkUserRating: PropTypes.func,
  buyLicense: PropTypes.func,
  createEscrow: PropTypes.func,
  error: PropTypes.string,
  userRating: PropTypes.number,
  isLicenseOwner: PropTypes.bool
};

const mapStateToProps = state => ({
  isLicenseOwner: license.selectors.isLicenseOwner(state),
  userRating: license.selectors.userRating(state),
  error: license.selectors.error(state)
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
