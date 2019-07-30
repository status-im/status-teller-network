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

import { version } from '../../../../package.json';

import "./index.scss";

import logo from "../../../images/logo.svg";

class Home extends Component {
  componentDidMount() {
    this.props.checkLicenseOwner();
    this.props.checkIsArbitrator();
  }

  sellUrl(){
    return this.props.isLicenseOwner ? '/sell' : '/license';
  }

  render() {
    const {hasPrices, t, priceError} = this.props;

    return (
      <div className="home">
        <Row>
          <Col xs={12} className="home-logo">
            <img alt="Logo" src={logo} width="200" height="200" />
          </Col>
        </Row>

        <Row className="home-headline">
          <Col xs={12}>
            <h1 className="text-center">{t('home.welcome')}</h1>
          </Col>
        </Row>

        <React.Fragment>
          <Row className="home--footer">
            <Col xs={12} className="text-center">
              <Button tag={Link} disabled={!hasPrices && !priceError} color="primary" block to="/offers/list" className="px-5">
                {hasPrices || priceError ? t('home.buy') : t('home.loadingData')}
              </Button>
              <p className="mt-3"><Link to={this.sellUrl()}>{t('home.createOffer')}</Link></p>
            </Col>
          </Row>
        </React.Fragment>
        <p className="teller-version text-muted"><Link to="/settings">Settings</Link> | Version: {version}</p>
      </div>
    );
  }
}

Home.propTypes = {
  t: PropTypes.func,
  checkLicenseOwner: PropTypes.func,
  checkIsArbitrator: PropTypes.func,
  isArbitrator: PropTypes.bool,
  isLicenseOwner: PropTypes.bool,
  profile: PropTypes.object,
  hasPrices: PropTypes.bool,
  priceError: PropTypes.bool
};


const mapStateToProps = (state) => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    isArbitrator: arbitrator.selectors.isLicenseOwner(state),
    profile: metadata.selectors.getProfile(state, address),
    hasPrices: prices.selectors.hasPrices(state),
    priceError: prices.selectors.error(state)
  };
};

export default connect(
  mapStateToProps,
  {
    checkLicenseOwner: license.actions.checkLicenseOwner,
    checkIsArbitrator: arbitrator.actions.checkLicenseOwner
  }
)(withNamespaces()(Home));
