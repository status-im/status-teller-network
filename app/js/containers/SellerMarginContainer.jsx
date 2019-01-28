import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import {withNamespaces} from 'react-i18next';
import seller from '../features/seller';
import {connect} from 'react-redux';
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
            <MarginSelectorForm fiat={this.props.fiat} margin={this.props.margin} onSubmit={this.props.setMarginRate} />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

SellerMarginContainer.propTypes = {
  t: PropTypes.func,
  setMarginRate: PropTypes.func,
  fiat: PropTypes.string,
  margin: PropTypes.object 
};

const mapStateToProps = state => ({
  fiat: seller.selectors.fiat(state),
  margin: seller.selectors.margin(state)
});

export default connect(
  mapStateToProps,
  {
    setMarginRate: seller.actions.setMarginRate
  }
)(withNamespaces()(SellerMarginContainer));
