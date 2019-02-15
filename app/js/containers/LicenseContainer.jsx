import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import license from "../features/license";
import balances from "../features/balances";

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
        <YourSNTBalance value={this.props.sntToken.balance}/>
        <LicenseBuy onClick={this.buyLicense} disabled={this.props.sntToken.balance < this.props.licensePrice}/>
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
  licensePrice: PropTypes.number,
  loadLicensePrice: PropTypes.func
};

const mapStateToProps = state => {
  return {
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    sntToken: balances.selectors.getTokenBySymbol(state, 'SNT'),
    licensePrice: license.selectors.getLicensePrice(state)
  };
};

export default connect(
  mapStateToProps,
  {
    buyLicense: license.actions.buyLicense,
    checkLicenseOwner: license.actions.checkLicenseOwner,
    loadLicensePrice: license.actions.loadPrice
  }
)(withRouter(LicenseContainer));
