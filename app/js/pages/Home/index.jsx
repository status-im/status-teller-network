import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';

import license from "../../features/license";

import "./index.scss";

class HomeContainer extends Component {
  componentDidMount() {
    this.props.checkLicenseOwner();
  }

  sellUrl(){
    return this.props.isLicenseOwner ? '/sell' : '/license';
  }

  render() {
    const t = this.props.t;
    return (
      <div className="home">
        <Row>
          <Col xs={12}>
            <p className="text-center home-logo rounded-circle">LOGO</p>
          </Col>
        </Row>

        <Row className="home-headline">
          <Col xs={12}>
            <h1 className="text-center">{t('home.welcome')}</h1>
          </Col>
        </Row>

        <Row className="home--footer">
          <Col xs={6}>
            <Button tag={Link} color="primary" block to="/offers/list">{t('home.buy')}</Button>
          </Col>
          <Col xs={6}>
            <Button tag={Link} color="primary" block to={this.sellUrl()}>{t('home.sell')}</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

HomeContainer.propTypes = {
  t: PropTypes.func,
  checkLicenseOwner: PropTypes.func,
  isLicenseOwner: PropTypes.bool
};

const mapStateToProps = state => ({
  isLicenseOwner: license.selectors.isLicenseOwner(state)
});

export default connect(
  mapStateToProps,
  {
    checkLicenseOwner: license.actions.checkLicenseOwner
  }
)(withNamespaces()(HomeContainer));
