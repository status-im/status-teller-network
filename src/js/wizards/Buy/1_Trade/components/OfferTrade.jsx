import React from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from "react-i18next";
import {Row, Col, FormGroup, Button, UncontrolledTooltip, Label} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {isNumber, lowerEqThan, higherEqThan} from "../../../../validators";
import Identicon from "../../../../components/UserInformation/Identicon";

const OfferTrade = ({
  statusContactCode, name, minToken, maxToken, price: _price, currency, asset, onClick,
  assetQuantity, currencyQuantity, onCurrencyChange, onAssetChange, disabled, t
}) => (
  <Row>
    <Col xs="12" className="mt-5 text-center">
      <h2>Trade amount with <br/><span><Identicon seed={statusContactCode}
                                                  className="rounded-circle border"/> {name}</span></h2>
      <p className="mt-3">
        Min: {minToken} {asset} - <span id="max-token">Max: {maxToken} {asset}</span>
        <UncontrolledTooltip placement="right" target="max-token">
          This is the current balance of the seller. This is why it is the maximum
        </UncontrolledTooltip>
      </p>
    </Col>
    <Col xs="12" className="mt-4">
      <Form className="text-center">
        <FormGroup>
          <Row>
            <Col xs={2} sm={1} className="v-align-center">
              <Label for="asset-quantity-input">Buy:</Label>
            </Col>
            <Col xs={10} sm={11}>
              <Input type="text" name="asset" className="form-control" value={assetQuantity} id="asset-quantity-input"
                     validations={[isNumber, lowerEqThan.bind(null, parseFloat(maxToken)), higherEqThan.bind(null, parseFloat(minToken))]}
                     placeholder="Asset quantity" onChange={(e) => onAssetChange(e.target.value)} step="any"/>
              <span className="input-icon mr-3">{asset}</span>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row>
            <Col xs={2} sm={1} className="v-align-center">
              <Label for="fiat-quantity-input" className="align-baseline">For:</Label>
            </Col>
            <Col xs={10} sm={11}>
              <Input type="text" name="fiat" className="form-control" value={currencyQuantity}
                     validations={[isNumber]} id="fiat-quantity-input"
                     placeholder="Fiat quantity" onChange={(e) => onCurrencyChange(e.target.value)} step="any"/>
              <span className="input-icon mr-3">{currency.id}</span>
            </Col>
          </Row>
        </FormGroup>
        {disabled && <p className="text-muted">{t('buyer.offerTrade.enterBefore')}</p>}
        <Button color="primary" className="px-4" onClick={onClick} disabled={disabled}>Open trade</Button>
      </Form>
    </Col>
  </Row>
);

OfferTrade.propTypes = {
  t: PropTypes.func,
  statusContactCode: PropTypes.string,
  name: PropTypes.string,
  currency: PropTypes.object,
  minToken: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  maxToken: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  asset: PropTypes.string,
  onClick: PropTypes.func,
  price: PropTypes.number,
  assetQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  currencyQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onCurrencyChange: PropTypes.func,
  onAssetChange: PropTypes.func,
  disabled: PropTypes.bool
};

export default withNamespaces()(OfferTrade);
