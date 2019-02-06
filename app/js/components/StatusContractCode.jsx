import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";

class StatusContractCode extends Component {
  render() {
    const t = this.props.t;
    return (
      <Row className="mt-4">
        <Col xs="12">
          <span className="font-weight-bold h5">{t('statusContractCode.title')}</span>
          <Link to="edit-status-contract-code" className="float-right">{t('statusContractCode.edit')}</Link>
        </Col>
        <Col xs="10" className="pr-0">
          <Card body className="rounded-0">
            <span>{this.props.value}</span>
          </Card>
        </Col>
        <Col xs="2" className="pl-0">
          <Card body className="text-center rounded-0">
            <span><FontAwesomeIcon size="lg" icon={faQrcode}/></span>
          </Card>
        </Col>
      </Row>
    );
  }
}

StatusContractCode.propTypes = {
  t: PropTypes.func,
  value: PropTypes.string
};

export default withNamespaces()(StatusContractCode);
