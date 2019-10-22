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
import metadata from "../../features/metadata";
import {withNamespaces} from "react-i18next";

const LICENSE_TOKEN_SYMBOL = 'SNT';

class License extends Component {
  componentDidMount() {
    if (!this.props.isEip1102Enabled) {
      return this.props.enableEthereum();
    }
    this.getUserInfos();
  }

  componentDidUpdate(prevProps) {
    if (this.props.isLicenseOwner) {
      return this.props.history.push('/sell');
    }
    if (!prevProps.isEip1102Enabled && this.props.isEip1102Enabled) {
      this.getUserInfos();
    }
    this.checkBalance();
  }

  componentWillUnmount() {
    if (this.pollBalanceInterval) {
      clearInterval(this.pollBalanceInterval);
    }
  }

  getUserInfos() {
    if (this.props.isLicenseOwner) {
      return this.props.history.push('/sell');
    }
    this.pollBalanceInterval = null;

    this.props.checkLicenseOwner();
    this.props.loadLicensePrice();
    this.props.updateBalance(LICENSE_TOKEN_SYMBOL);
  }

  checkBalance() {
    if (!this.props.sntToken || (!this.props.sntToken.balance && this.props.sntToken.balance !== 0) || !this.props.isEip1102Enabled) {
      return;
    }
    if (this.enoughBalance()) {
      if (this.pollBalanceInterval) {
        clearInterval(this.pollBalanceInterval);
      }
    } else {
      if (!this.pollBalanceInterval) {
        this.pollBalanceInterval = setInterval(() => {
          this.props.updateBalance(LICENSE_TOKEN_SYMBOL);
        }, 2000);
      }
    }
  }

  buyLicense = () => {
    this.setState({isBuying: true});
    this.props.buyLicense();
  };

  enoughBalance() {
    return this.props.sntToken && parseInt(this.props.sntToken.balance, 10) >= parseInt(this.props.licensePrice, 10);
  }

  render() {
    if (!this.props.isEip1102Enabled) {
      return <p>{this.props.t('ethereumEnable.createOffer')}</p>;
    }
    if (!this.props.sntToken) {
      return <ErrorInformation sntTokenError retry={this.buyLicense}/>;
    }
    if (this.props.error) {
      return <ErrorInformation transaction retry={this.buyLicense} message={this.props.error} cancel={this.props.cancelBuyLicense}/>;
    }

    if (this.props.isLoading) {
      return <Loading mining txHash={this.props.txHash}/>;
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
  t: PropTypes.func,
  history: PropTypes.object,
  wizard: PropTypes.object,
  checkLicenseOwner: PropTypes.func,
  buyLicense: PropTypes.func,
  isEip1102Enabled: PropTypes.bool,
  isLicenseOwner: PropTypes.bool,
  isLoading: PropTypes.bool,
  txHash: PropTypes.string,
  error: PropTypes.string,
  sntToken: PropTypes.object,
  licensePrice: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  loadLicensePrice: PropTypes.func,
  updateBalance: PropTypes.func,
  enableEthereum: PropTypes.func,
  cancelBuyLicense: PropTypes.func
};

const mapStateToProps = state => {
  return {
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    isLoading: license.selectors.isLoading(state),
    txHash: license.selectors.txHash(state),
    error: license.selectors.error(state),
    sntToken: network.selectors.getTokenBySymbol(state, LICENSE_TOKEN_SYMBOL),
    licensePrice: license.selectors.getLicensePrice(state),
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state)
  };
};

export default connect(
  mapStateToProps,
  {
    buyLicense: license.actions.buyLicense,
    cancelBuyLicense: license.actions.cancelBuyLicense,
    checkLicenseOwner: license.actions.checkLicenseOwner,
    loadLicensePrice: license.actions.loadPrice,
    updateBalance: network.actions.updateBalance,
    enableEthereum: metadata.actions.enableEthereum
  }
)(withRouter(withNamespaces()(License)));
