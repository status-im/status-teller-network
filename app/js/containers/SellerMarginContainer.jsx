import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import {withNamespaces} from 'react-i18next';
import seller from '../features/seller';
import {connect} from 'react-redux';
import { getEthUsdPrice, hasPricesError } from '../features/prices/reducer';
import MarginSelectorForm from '../components/MarginSelectorForm';

class SellerMarginContainer extends Component {
  render() {
    const t = this.props.t;
    return (
      <Fragment>
        <Row>
          <Col xs={12} className="my-auto">
            <h1 className="text-center">{t('sellerMarginContainer.title')}</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <MarginSelectorForm fiat={this.props.fiat} onSubmit={() => { console.log("SUBMIT"); }} />
          </Col>
        </Row>
        <Row>
          <Col>
            {this.props.ethUsd}
          </Col>
        </Row>
      </Fragment>
    );
  }
}

SellerMarginContainer.propTypes = {
  t: PropTypes.func,
  setFiatCurrency: PropTypes.func,
  ethUsd: PropTypes.number,
  fiat: PropTypes.string
};

const mapStateToProps = state => ({
  fiat: seller.selectors.fiat(state),
  ethUsd: getEthUsdPrice(state),
  hasErrors: hasPricesError(state)
});

export default connect(
  mapStateToProps,
  {
    setFiatCurrency: seller.actions.setFiatCurrency
  }
)(withNamespaces()(SellerMarginContainer));
