import React from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from "react-i18next";
import {Row, Col, FormGroup, Button} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Blockies from 'react-blockies';
import {isNumber, lowerEqThan, higherEqThan} from "../../validators";

const OfferTrade = ({address, name, min, max, fiat, asset, onClick, assetQty, fiatQty, onFiatChange, onAssetChange, disabled, t}) => (
  <Row>
    <Col xs="12" className="mt-5 text-center">
      <h2>Trade amount with <br/><span><Blockies seed={address || '0x0'} className="rounded-circle"/> {name}</span></h2>
      <p className="mt-3">Min: {min}{fiat.symbol} - Max: {max}{fiat.symbol}</p>
    </Col>
    <Col xs="12" className="mt-4">
      <Form className="text-center">
        <FormGroup>
          <Input type="number" name="fiat" className="form-control" value={fiatQty}
                 validations={[isNumber, lowerEqThan.bind(null, max), higherEqThan.bind(null, min)]}
                 placeholder="Fiat quantity" onChange={(e) => onFiatChange(e.target.value)}/>
          <span className="input-icon">{fiat.id}</span>
        </FormGroup>
        <FormGroup>
          <Input type="number" name="asset" className="form-control" value={assetQty} validations={[isNumber]}
                 placeholder="Asset quantity" onChange={(e) => onAssetChange(e.target.value)}/>
          <span className="input-icon">{asset}</span>
        </FormGroup>
        {disabled && <p className="text-info">{t('buyer.offerTrade.enterBefore')}</p>}
        <Button color="primary" className="px-4" onClick={onClick} disabled={disabled}>Open trade</Button>
      </Form>
    </Col>
  </Row>
);

OfferTrade.propTypes = {
  t: PropTypes.func,
  address: PropTypes.string,
  name: PropTypes.string,
  fiat: PropTypes.object,
  min: PropTypes.number,
  max: PropTypes.number,
  asset: PropTypes.string,
  onClick: PropTypes.func,
  assetQty: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  fiatQty: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onFiatChange: PropTypes.func,
  onAssetChange: PropTypes.func,
  disabled: PropTypes.bool
};

export default withNamespaces()(OfferTrade);
