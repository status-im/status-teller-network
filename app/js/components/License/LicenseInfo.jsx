import React, {Component} from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';

class LicenseInfo extends Component {
  render() {
    const t = this.props.t;
    return (
      <div className="mt-5 mb-5">
        <Row>
          <Col xs={12}>
            <h2 className="text-center">{t('sellerLicenseInfo.title')}</h2>
          </Col>
        </Row>

        <Card color="primary" className="mt-5 py-4">
          <CardBody className="text-center">
            {t('sellerLicenseInfo.fee')}
          </CardBody>
        </Card>

        <Card color="primary" className="mt-5 py-4">
          <CardBody className="text-center">
            {t('sellerLicenseInfo.stake', {price: this.props.price})}
          </CardBody>
        </Card>
      </div>
    );
  }
}

LicenseInfo.propTypes = {
  t: PropTypes.func,
  price: PropTypes.string
};

export default withNamespaces()(LicenseInfo);
