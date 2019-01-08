import React, { Component } from 'react'
import { connect } from 'react-redux';
import license from '../features/license';
import License from '../components/License';

class LicenseContainer extends Component {
  componentDidMount() {
    this.props.checkLicenseOwner();
  }

  buyLicense = () => {
    this.props.buyLicense()
  }

  render() {
    return <License buyLicense={this.buyLicense} isLicenseOwner={this.props.isLicenseOwner} />
  }
}

const mapStateToProps = state => ({
  isLicenseOwner: license.selectors.isLicenseOwner(state),
})

export default connect(
  mapStateToProps, 
  { 
    buyLicense: license.actions.buyLicense,
    checkLicenseOwner: license.actions.checkLicenseOwner
  }
)(LicenseContainer)
