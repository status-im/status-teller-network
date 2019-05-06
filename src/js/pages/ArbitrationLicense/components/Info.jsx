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
            <h2 className="text-center">Title about arbitration License</h2>
          </Col>
        </Row>

        <div className="stake-card mt-3 py-3 text-center rounded font-weight-bold">
          Stake {this.props.price}<br/> for arbitrator license
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
