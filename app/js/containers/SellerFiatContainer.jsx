import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import {withNamespaces} from 'react-i18next';
import FiatSelectorForm from "../components/FiatSelectorForm";
import seller from '../features/seller';
import {connect} from 'react-redux';


const SellerFiatContainer = (props) => (
<Fragment>
  <Row>
    <Col xs={12} className="my-auto">
      <h1 className="text-center">{props.t('sellerFiatContainer.title')}</h1>
    </Col>
  </Row>
  <Row>
    <Col>
      <FiatSelectorForm value={props.fiat} onSubmit={props.setFiatCurrency} />
    </Col>
  </Row>
</Fragment>
);

SellerFiatContainer.propTypes = {
  t: PropTypes.func,
  setFiatCurrency: PropTypes.func,
  fiat: PropTypes.string
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
