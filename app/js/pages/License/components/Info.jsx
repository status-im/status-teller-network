import React, {Component} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';

import "./Info.scss";

class LicenseInfo extends Component {
  render() {
    const t = this.props.t;
    return (
      <div className="mt-2">
        <Row>
          <Col xs={12}>
            <h2 className="text-center">{t('sellerLicenseInfo.title')}</h2>
          </Col>
        </Row>

        <div className="fee-card mt-3 py-3 text-center rounded font-weight-bold">
          {t('sellerLicenseInfo.fee')}<br/>{t('sellerLicenseInfo.fee2')}
        </div>

        <div className="stake-card mt-3 py-3 text-center rounded font-weight-bold">
          {t('sellerLicenseInfo.stake', {price: this.props.price})}<br/>{t('sellerLicenseInfo.stake2')}
        </div>
      </div>
    );
  }
}

LicenseInfo.propTypes = {
  t: PropTypes.func,
  price: PropTypes.number
};

export default withNamespaces()(LicenseInfo);
