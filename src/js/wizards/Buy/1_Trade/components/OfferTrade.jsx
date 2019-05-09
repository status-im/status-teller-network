import React from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from "react-i18next";
import {Row, Col, FormGroup, Button} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {isNumber, lowerEqThan, higherEqThan} from "../../../../validators";
import Identicon from "../../../../components/UserInformation/Identicon";

const OfferTrade = ({
  statusContactCode, name, minFIAT, maxFIAT, price, currency, asset, onClick,
  assetQuantity, currencyQuantity, onCurrencyChange, onAssetChange, disabled, t
}) => (
  <Row>
    <Col xs="12" className="mt-5 text-center">
       <h2>Trade amount with <br/><span><Identicon seed={statusContactCode} className="rounded-circle border"/> {name}</span></h2>
      <p className="mt-3">Min: {minFIAT}{currency.id} - Max: {maxFIAT}{currency.id}</p>
    </Col>
    <Col xs="12" className="mt-4">
      <Form className="text-center">
        <FormGroup>
          <Input type="number" name="fiat" className="form-control" value={currencyQuantity}
                 validations={[isNumber, lowerEqThan.bind(null, maxFIAT), higherEqThan.bind(null, minFIAT)]}
                 placeholder="Fiat quantity" onChange={(e) => onCurrencyChange(e.target.value)} step="any" />
          <span className="input-icon">{currency.id}</span>
        </FormGroup>
        <FormGroup>
          <Input type="number" name="asset" className="form-control" value={assetQuantity} validations={[isNumber, lowerEqThan.bind(null, maxFIAT/price),  higherEqThan.bind(null, minFIAT/price)]}
                 placeholder="Asset quantity" onChange={(e) => onAssetChange(e.target.value)} step="any" />
          <span className="input-icon">{asset}</span>
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
  minFIAT: PropTypes.number,
  maxFIAT: PropTypes.number,
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
