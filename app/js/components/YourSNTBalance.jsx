import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'reactstrap';
import { withNamespaces } from 'react-i18next';

class YourSNTBalance extends Component {
  render() {
    const t = this.props.t;
    return (
      <Row className="mt-5">
        <Col xs="12">
          <span className="font-weight-bold h5">{t('yourSNTBalance.label')}</span>
        </Col>
        <Col xs="12" className="pr-0">
          <Card body className="rounded-0">
            <span>{this.props.value} SNT</span>
          </Card>
        </Col>
      </Row>
    );
  }
}

YourSNTBalance.propTypes = {
  t: PropTypes.func,
  value: PropTypes.number
};

export default withNamespaces()(YourSNTBalance);
