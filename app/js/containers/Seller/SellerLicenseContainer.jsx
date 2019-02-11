import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import license from "../../features/license";
import balances from "../../features/balances";
import embarkjs from '../../features/embarkjs';

import SellerBuyLicense from '../../components/Seller/SellerBuyLicense';
import SellerLicenseInfo from '../../components/Seller/SellerLicenseInfo';
import YourSNTBalance from '../../components/YourSNTBalance';

class SellerLicenseContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  componentDidMount() {
    this.props.loadSNTBalance(this.props.address);
    this.props.checkLicenseOwner();
  }

  componentDidUpdate() {
    if (this.props.isLicenseOwner) {
      return this.props.wizard.next();
    }
  }

  buyLicense = () => {
    this.props.buyLicense();
  };

  render() {
    return (
      <React.Fragment>
        <SellerLicenseInfo />
        <YourSNTBalance value={this.props.sntBalance}/>
        <SellerBuyLicense onClick={this.buyLicense} disabled={this.props.sntBalance === 0}/>
      </React.Fragment>
    );
  }
}

SellerLicenseContainer.propTypes = {
  address: PropTypes.string,
  wizard: PropTypes.object,
  checkLicenseOwner: PropTypes.func,
  buyLicense: PropTypes.func,
  isLicenseOwner: PropTypes.bool,
  loadSNTBalance: PropTypes.func,
  sntBalance: PropTypes.number
};

const mapStateToProps = state => {
  const address = embarkjs.selectors.getAddress(state) || '';
  return {
    address,
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    sntBalance: balances.selectors.getSNTBalance(state, address)
  }
};

export default connect(
  mapStateToProps,
  {
    loadSNTBalance: balances.actions.loadSNTBalance,
    buyLicense: license.actions.buyLicense,
    checkLicenseOwner: license.actions.checkLicenseOwner
  }
)(SellerLicenseContainer);
