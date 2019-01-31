import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import {withNamespaces} from 'react-i18next';

class HomeContainer extends Component {
  render() {
    const t = this.props.t;
    return (
      <Fragment>
        <Row className="h-75">
          <Col xs={12} className="my-auto">
            <h1 className="text-center">{t('home.welcome')}</h1>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col xs={6}>
            <Button tag={Link} color="info" block to="/buy">{t('home.buy')}</Button>
          </Col>
          <Col xs={6}>
            <Button tag={Link} color="info" block to="/sell">{t('home.sell')}</Button>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

HomeContainer.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(HomeContainer);
