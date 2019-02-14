import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import license from "../features/license";
import balances from "../features/balances";
import embarkjs from "../features/embarkjs";

import LicenseInfo from '../components/License/LicenseInfo';
import LicenseBuy from '../components/License/LicenseBuy';
import Loading from '../components/ui/Loading';
import YourSNTBalance from '../components/YourSNTBalance';

class LicenseContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { isBuying: false };
  }

  componentDidMount() {
    this.props.loadSNTBalance(this.props.address);
    this.props.checkLicenseOwner();
    this.props.loadLicensePrice();
  }

  componentDidUpdate() {
    if (this.props.isLicenseOwner) {
      this.setState({isBuying: false});
      return this.props.history.push('/sell');
    }
  }

  buyLicense = () => {
    this.setState({isBuying: true});
    this.props.buyLicense();
  };

  render() {
    if (this.state.isBuying) {
      return <Loading mining/>;
    }

    return (
      <React.Fragment>
        <LicenseInfo price={this.props.licensePrice} />
        <YourSNTBalance value={this.props.sntBalance}/>
        <LicenseBuy onClick={this.buyLicense} disabled={this.props.sntBalance < this.props.licensePrice}/>
      </React.Fragment>
    );
  }
}

LicenseContainer.propTypes = {
  history: PropTypes.object,
  address: PropTypes.string,
  wizard: PropTypes.object,
  checkLicenseOwner: PropTypes.func,
  buyLicense: PropTypes.func,
  isLicenseOwner: PropTypes.bool,
  loadSNTBalance: PropTypes.func,
  sntBalance: PropTypes.number,
  licensePrice: PropTypes.number,
  loadLicensePrice: PropTypes.func
};

const mapStateToProps = state => {
  const address = embarkjs.selectors.getAddress(state) || '';
  return {
    address,
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    sntBalance: balances.selectors.getSNTBalance(state, address),
    licensePrice: license.selectors.getLicensePrice(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadSNTBalance: balances.actions.loadSNTBalance,
    buyLicense: license.actions.buyLicense,
    checkLicenseOwner: license.actions.checkLicenseOwner,
    loadLicensePrice: license.actions.loadPrice
  }
)(withRouter(LicenseContainer));
