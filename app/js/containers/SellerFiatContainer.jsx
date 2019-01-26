import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import {withNamespaces} from 'react-i18next';
import FiatSelectorForm from "../components/FiatSelectorForm";
import seller from '../features/seller';
import {connect} from 'react-redux';


class SellerFiatContainer extends Component {
  render() {
    console.log(this.state);
    const t = this.props.t;
    return (
      <Fragment>
        <Row>
          <Col xs={12} className="my-auto">
            <h1 className="text-center">What local currency do you want to trade with?</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <FiatSelectorForm onSubmit={this.props.setFiatCurrency} />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

SellerFiatContainer.propTypes = {
  t: PropTypes.func,
  setFiatCurrency: PropTypes.func
};

const mapStateToProps = state => ({
  fiat: seller.selectors.fiat(state)
});

export default connect(
  mapStateToProps,
  {
    setFiatCurrency: seller.actions.setFiatCurrency
  }
)(withNamespaces()(SellerFiatContainer));
