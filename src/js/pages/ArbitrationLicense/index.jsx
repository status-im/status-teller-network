import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import arbitration from "../../features/arbitration";
import network from "../../features/network";
import metadata from "../../features/metadata";

import Info from '../License/components/Info';
import BuyButton from '../License/components/BuyButton';
import Balance from '../License/components/Balance';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';

const LICENSE_TOKEN_SYMBOL = 'SNT';

class ArbitrationLicense extends Component {
  componentDidMount() {
    if (this.props.isLicenseOwner) {
      this.props.loadProfile(this.props.address);
      return this.props.history.push('/');
    }

    this.props.checkLicenseOwner();
    this.props.loadLicensePrice();
    this.props.updateBalance(LICENSE_TOKEN_SYMBOL);
  }

  componentDidUpdate() {
    if (this.props.isLicenseOwner) {
      this.props.loadProfile(this.props.address);
      return this.props.history.push('/');
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
    if (this.props.isError) {
      return <ErrorInformation transaction retry={this.buyLicense}/>;
    }
    
    if (this.props.isLoading) {
      return <Loading mining/>;
    }

    if (!this.props.sntToken) {
      return <ErrorInformation sntTokenError retry={this.buyLicense}/>;
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

ArbitrationLicense.propTypes = {
  history: PropTypes.object,
  wizard: PropTypes.object,
  checkLicenseOwner: PropTypes.func,
  buyLicense: PropTypes.func,
  isLicenseOwner: PropTypes.bool,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  sntToken: PropTypes.object,
  licensePrice: PropTypes.number,
  loadLicensePrice: PropTypes.func,
  updateBalance: PropTypes.func,
  loadProfile: PropTypes.func,
  address: PropTypes.string
};

const mapStateToProps = state => {
  return {
    address: network.selectors.getAddress(state) || '',
    isLicenseOwner: arbitration.selectors.isLicenseOwner(state),
    isLoading: arbitration.selectors.isLoading(state),
    isError: arbitration.selectors.isError(state),
    sntToken: network.selectors.getTokenBySymbol(state, LICENSE_TOKEN_SYMBOL),
    licensePrice: arbitration.selectors.getLicensePrice(state)
  };
};

export default connect(
  mapStateToProps,
  {
    buyLicense: arbitration.actions.buyLicense,
    checkLicenseOwner: arbitration.actions.checkLicenseOwner,
    loadLicensePrice: arbitration.actions.loadPrice,
    updateBalance: network.actions.updateBalance,
    loadProfile: metadata.actions.load
  }
)(withRouter(ArbitrationLicense));
