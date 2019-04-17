import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';

import license from "../../features/license";
import network from "../../features/network";
import metadata from "../../features/metadata";

import { version } from '../../../../package.json';

import "./index.scss";

import logo from "../../../images/logo.svg";

class Home extends Component {
  componentDidMount() {
    this.props.checkLicenseOwner();
  }

  sellUrl(){
    return this.props.isLicenseOwner ? '/sell' : '/license';
  }

  render() {
    const isArbitrator = this.props.profile && this.props.profile.isArbitrator;
    const t = this.props.t;
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

        {!isArbitrator && <Row className="home--footer">
          <Col xs={6}>
            <Button tag={Link} color="primary" block to="/offers/list">{t('home.buy')}</Button>
          </Col>
          <Col xs={6}>
            <Button tag={Link} color="primary" block to={this.sellUrl()}>{t('home.sell')}</Button>
          </Col>
        </Row>}
        <p className="teller-version text-muted">Version: {version}</p>
      </div>
    );
  }
}

Home.propTypes = {
  t: PropTypes.func,
  checkLicenseOwner: PropTypes.func,
  isLicenseOwner: PropTypes.bool,
  profile: PropTypes.object
};


const mapStateToProps = (state) => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    isLicenseOwner: license.selectors.isLicenseOwner(state),
    profile: metadata.selectors.getProfile(state, address)
  };
};

export default connect(
  mapStateToProps,
  {
    checkLicenseOwner: license.actions.checkLicenseOwner
  }
)(withNamespaces()(Home));
