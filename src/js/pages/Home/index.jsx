import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';

import license from "../../features/license";
import network from "../../features/network";
import metadata from "../../features/metadata";
import prices from "../../features/prices";
import arbitrator from "../../features/arbitration";
import newSeller from "../../features/newSeller";
import newBuy from "../../features/newBuy";

import { version } from '../../../../package.json';

import "./index.scss";

class Home extends Component {
  componentDidMount() {
    if (!this.props.isEip1102Enabled) {
      return;
    }
    this.props.checkIsArbitrator();
    this.props.resetNewOfferData();
    this.props.resetNewBuy();
  }

  sellUrl(){
    return '/sell';
    // return this.props.isLicenseOwner ? '/sell' : '/license';
  }

  render() {
    const {hasPrices, t, priceError} = this.props;

    return (
      <div className="home">
        <Row className="home-headline">
          <Col xs={12}>
            <h1 className="text-center font-weight-bold">{t('home.welcome')}</h1>
            <h3 className="text-center home-details font-weight-normal">{t('home.details')}</h3>
          </Col>
        </Row>

        <Row className="home--footer">
          <Col xs={12} className="text-center">
            <Button tag={Link} disabled={!hasPrices && !priceError} color="primary" to="/offers/list" className="d-block mx-auto">
              {hasPrices || priceError ? t('home.buy') : t('home.loadingData')}
            </Button>

            <Button tag={Link} color="secondary" to={this.sellUrl()} className="d-block mx-auto mt-2">
              {t('home.createOffer')}
            </Button>
          </Col>
        </Row>
        <p className="teller-version text-muted"><Link to="/settings">Settings</Link> | Version: {version}</p>
      </div>
    );
  }
}

Home.propTypes = {
  t: PropTypes.func,
  checkIsArbitrator: PropTypes.func,
  isArbitrator: PropTypes.bool,
  isEip1102Enabled: PropTypes.bool,
  profile: PropTypes.object,
  hasPrices: PropTypes.bool,
  priceError: PropTypes.bool,
  resetNewOfferData: PropTypes.func,
  resetNewBuy: PropTypes.func
};


const mapStateToProps = (state) => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    isArbitrator: arbitrator.selectors.isLicenseOwner(state),
    profile: metadata.selectors.getProfile(state, address),
    hasPrices: prices.selectors.hasPrices(state),
    priceError: prices.selectors.error(state),
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state)
  };
};

export default connect(
  mapStateToProps,
  {
    checkIsArbitrator: arbitrator.actions.checkLicenseOwner,
    resetNewOfferData: newSeller.actions.resetNewOfferData,
    resetNewBuy: newBuy.actions.resetNewBuy
  }
)(withNamespaces()(Home));
