import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import license from "../features/license";
import network from "../features/network";

import LicenseInfo from '../components/License/LicenseInfo';
import LicenseBuy from '../components/License/LicenseBuy';
import Loading from '../components/ui/Loading';
import YourSNTBalance from '../components/YourSNTBalance';

const LICENSE_TOKEN_SYMBOL = 'SNT';

class LicenseContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { isBuying: false };
  }

  componentDidMount() {
    if (this.props.isLicenseOwner) {
      return this.props.history.push('/sell');
    }

    this.props.checkLicenseOwner();
    this.props.loadLicensePrice();
    this.props.updateBalance(LICENSE_TOKEN_SYMBOL);
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

  enoughBalance() {
    return parseInt(this.props.sntToken.balance, 10) >= parseInt(this.props.licensePrice, 10);
  }

  render() {
    if (this.state.isBuying) {
      return <Loading mining/>;
    }

    return (
      <React.Fragment>
        <LicenseInfo price={this.props.licensePrice} />
        <div className="mt-5">
          <YourSNTBalance value={this.props.sntToken.balance} disabled={!this.enoughBalance()}/>
        </div>
        <LicenseBuy onClick={this.buyLicense} disabled={!this.enoughBalance()}/>
      </React.Fragment>
    );
  }
}

LicenseContainer.propTypes = {
  history: PropTypes.object,
  wizard: PropTypes.object,
  checkLicenseOwner: PropTypes.func,
  buyLicense: PropTypes.func,
  isLicenseOwner: PropTypes.bool,
  sntToken: PropTypes.object,
  licensePrice: PropTypes.string,
  loadLicensePrice: PropTypes.func,
  updateBalance: PropTypes.func
};

const mapStateToProps = state => {
  return {
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    sntToken: network.selectors.getTokenBySymbol(state, LICENSE_TOKEN_SYMBOL),
    licensePrice: license.selectors.getLicensePrice(state)
  };
};

export default connect(
  mapStateToProps,
  {
    buyLicense: license.actions.buyLicense,
    checkLicenseOwner: license.actions.checkLicenseOwner,
    loadLicensePrice: license.actions.loadPrice,
    updateBalance: network.actions.updateBalance
  }
)(withRouter(LicenseContainer));
