import React, {Component} from 'react';
import {Row, Col, Button} from 'reactstrap';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';

class LicenseBuy extends Component {
  render() {
    const t = this.props.t;
    return (
      <Row className="mt-2">
        <Col xs={12} className="text-center">
          <Button color="primary" onClick={this.props.onClick} disabled={this.props.disabled}>{t('sellerBuyLicense.button')}</Button>
        </Col>
      </Row>
    );
  }
}

LicenseBuy.propTypes = {
  t: PropTypes.func,
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};

export default withTranslation()(LicenseBuy);
