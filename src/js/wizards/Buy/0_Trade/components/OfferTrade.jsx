import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from "react-i18next";
import {Row, Col, FormGroup, UncontrolledTooltip, Label, FormFeedback} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {isNumber, lowerEqThan, higherEqThan, higherThan} from "../../../../validators";
import {limitDecimals} from '../../../../utils/numbers';
import moment from "moment";
import escrow from "../../../../features/escrow";
import UserInformation from "../../../../components/UserInformation";

const OfferTrade = ({
  seller, minToken, maxToken, currency, asset, lastActivity, limitless,
  assetQuantity, currencyQuantity, onCurrencyChange, onAssetChange, disabled, t, notEnoughETH, canRelay,
  limitH, limitL, sellerBalance
}) => {
  const minFiat = (parseFloat(limitL) / 100).toFixed(2);
  const maxFiat = (parseFloat(limitH) / 100).toFixed(2);
  const amountGreaterThanBalance = parseFloat(assetQuantity) > parseFloat(sellerBalance);

  return <Row>
    <Col xs="12" className="mt-5 text-center">

      <UserInformation username={seller.username} reputation={{downCount: seller.downCount, upCount: seller.upCount}}
                       identiconSeed={seller.statusContactCode} nbCreatedTrades={seller.nbCreatedTrades}
                       nbReleasedTrades={seller.nbReleasedTrades}/>
    </Col>
    <Col xs="12" className="mt-4">
      <Form className="text-center">
        <FormGroup>
          <Row>
            <Col xs={2} sm={1} className="v-align-center">
              <Label for="asset-quantity-input">Buy:</Label>
            </Col>
            <Col xs={10} sm={11}>
              <Input type="text"
                     name="asset" className="form-control" value={assetQuantity} id="asset-quantity-input"
                     data-maxvalue={parseFloat(maxToken) || ''}
                     data-minvalue={parseFloat(minToken) || ''}
                     validations={[isNumber, lowerEqThan, higherEqThan]}
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
                     data-maxvalue={limitless ? '' : maxFiat}
                     data-minvalue={0}
                     validations={[isNumber, lowerEqThan, higherThan]}
                     id="fiat-quantity-input"
                     placeholder="Fiat quantity" onChange={(e) => onCurrencyChange(e.target.value)} step="any"/>
              <span className="input-icon mr-3">{currency.id}</span>
            </Col>
          </Row>
        </FormGroup>
        { limitless && <p className="mt-3">
        Limits: {limitDecimals(minToken)} {asset} to <span id="max-token">{limitDecimals(maxToken)} {asset}</span>
        <UncontrolledTooltip placement="right" target="max-token">
          This is the current balance of the seller. This is why it is the maximum
        </UncontrolledTooltip>
        </p> }
        { !limitless && <Fragment>
            { amountGreaterThanBalance && <FormFeedback className="d-block">Amount is greater than the seller&apos;s balance</FormFeedback> }
            <p className="mt-3">Limits: {limitDecimals(minFiat)} {currency.id} to <span id="max-token">{limitDecimals(maxFiat)} {currency.id}</span></p>
          </Fragment>
        }
        {disabled && <p className="text-muted">{t('buyer.offerTrade.enterBefore')}</p>}
        {notEnoughETH && !canRelay && <Col xs="12" className="text-small text-center text-danger">
              New orders can be created in {moment(escrow.helpers.nextRelayDate(lastActivity)).toNow(true)}
        </Col>}
      </Form>
    </Col>
  </Row>;
};


OfferTrade.propTypes = {
  t: PropTypes.func,
  seller: PropTypes.object,
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
  price: PropTypes.number,
  assetQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  currencyQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  sellerBalance: PropTypes.string,
  onCurrencyChange: PropTypes.func,
  onAssetChange: PropTypes.func,
  disabled: PropTypes.bool,
  notEnoughETH: PropTypes.bool,
  canRelay: PropTypes.bool,
  lastActivity: PropTypes.number,
  limitless: PropTypes.bool,
  limitL: PropTypes.string,
  limitH: PropTypes.string
};

export default withNamespaces()(OfferTrade);
