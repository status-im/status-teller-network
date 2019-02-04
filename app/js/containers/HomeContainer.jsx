import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import {withNamespaces} from 'react-i18next';

import "./HomeContainer.scss";

class HomeContainer extends Component {
  render() {
    const t = this.props.t;
    return (
      <div className="home">
        <Row className="home-headline">
          <Col xs={12}>
            <h1 className="text-center">{t('home.welcome')}</h1>
          </Col>
        </Row>

        <Row className="home--footer">
          <Col xs={6}>
            <Button tag={Link} color="info" block to="/buy">{t('home.buy')}</Button>
          </Col>
          <Col xs={6}>
            <Button tag={Link} color="info" block to="/sell">{t('home.sell')}</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

HomeContainer.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(HomeContainer);
