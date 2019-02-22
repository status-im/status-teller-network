import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import license from "../../features/license";
import network from "../../features/network";

import Info from './components/Info';
import BuyButton from './components/BuyButton';
import Balance from './components/Balance';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';

const LICENSE_TOKEN_SYMBOL = 'SNT';

class License extends Component {
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
    if (this.props.isLoading) {
      return <Loading mining/>;
    }

    if (this.props.isError) {
      return <ErrorInformation transaction retry={this.buyLicense}/>;
    }
    return (
      <React.Fragment>
        <Info price={this.props.licensePrice} />
        <div className="mt-5">
          <Balance value={this.props.sntToken.balance} disabled={!this.enoughBalance()}/>
        </div>
        <BuyButton onClick={this.buyLicense} disabled={!this.enoughBalance()}/>
      </React.Fragment>
    );
  }
}

License.propTypes = {
  history: PropTypes.object,
  wizard: PropTypes.object,
  checkLicenseOwner: PropTypes.func,
  buyLicense: PropTypes.func,
  isLicenseOwner: PropTypes.bool,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  sntToken: PropTypes.object,
  licensePrice: PropTypes.string,
  loadLicensePrice: PropTypes.func,
  updateBalance: PropTypes.func
};

const mapStateToProps = state => {
  return {
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    isLoading: license.selectors.isLoading(state),
    isError: license.selectors.isError(state),
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
)(withRouter(License));
