import React, { Component } from 'react'
import { connect } from 'react-redux';
import license from '../features/license';
import License from '../components/License';

class LicenseContainer extends Component {
  componentDidMount() {
    this.props.checkLicenseOwner();
    this.props.checkUserRating();
  }

  buyLicense = () => {
    this.props.buyLicense()
  }

  render() {
    return <License buyLicense={this.buyLicense} isLicenseOwner={this.props.isLicenseOwner} userRating={this.props.userRating} />
  }
}

const mapStateToProps = state => ({
  isLicenseOwner: license.selectors.isLicenseOwner(state),
  userRating: license.selectors.userRating(state)
})

export default connect(
  mapStateToProps,
  {
    buyLicense: license.actions.buyLicense,
    checkLicenseOwner: license.actions.checkLicenseOwner,
    checkUserRating: license.actions.checkUserRating
  }
)(LicenseContainer)
