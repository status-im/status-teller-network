import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';
import Blockies from 'react-blockies';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

class Trades extends Component {
  renderTrades() {
    return (
      <Card body className="py-0">
        {this.props.trades.map((trade, index) => (
          <div key={index} className="d-flex my-1">
            <span className="flex-fill align-self-center">
              <Blockies seed={trade.address} className="align-middle rounded-circle"/>
              <span className="ml-2">{trade.name}</span>
            </span>
            <span className="flex-fill align-self-center">{trade.value} ETH</span>
            <span className="flex-fill align-self-center text-right text-success">
              <FontAwesomeIcon icon={faCircle} className="mr-2"/>
              {trade.status}
            </span>
          </div>
        ))}
      </Card>
    );
  }

  renderEmpty(t) {
    return (
      <Card body className="text-center">
        {t('trades.noOpen')}
      </Card>
    );
  }

  render() {
    const t = this.props.t;
    return (
      <Row className="mt-4">
        <Col xs="12">
          <span className="font-weight-bold h5">{t('trades.title')}</span>
          <Link to="/buy" className="float-right">{t('trades.find')}</Link>
        </Col>
        <Col xs="12">
          {this.props.trades.length === 0 ? this.renderEmpty(t) : this.renderTrades()}
        </Col>
      </Row>
    );
  }
}

Trades.propTypes = {
  t: PropTypes.func,
  trades: PropTypes.array
};

export default withNamespaces()(Trades);
