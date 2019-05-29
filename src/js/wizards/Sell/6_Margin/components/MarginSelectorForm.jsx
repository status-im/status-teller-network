/* global web3 */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, InputGroup, InputGroupAddon, InputGroupText, Col, Row} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import {isNumber, required, lowerEqThan, higherEqThan} from '../../../../validators';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import './MarginSelectorForm.scss';

class MarginSelectorForm extends Component {
  onMarginChange = (value) => {
    this.props.marginChange(value);
  };

  render() {
    const {t, currency, margin, token, prices, fee} = this.props;

    const basePrice = prices[token.symbol][currency];
    const marginPrice = (margin || 0) / 100 * basePrice;
    const calcPrice = basePrice + marginPrice;

    return (
      <Form ref={c => {
        this.form = c;
      }}>
        <h2>{t('sellerMarginContainer.title')}</h2>
        <FormGroup className="mb-0">
          <Row>
            <Col xs={9}>
              <Slider className="mb-3 p-4" min={-100} max={100} defaultValue={0}
                      onChange={(value) => this.onMarginChange(value)} value={margin}/>
            </Col>
            <Col>
              <InputGroup className="full-width-input">
                <Input type="number"
                       name="margin"
                       id="margin"
                       placeholder="0"
                       className="form-control prepend"
                       value={margin}
                       onChange={(e) => this.onMarginChange(e.target.value)}
                       validations={[required, isNumber, lowerEqThan.bind(null, 100), higherEqThan.bind(null, -100)]}/>
                <InputGroupAddon addonType="append"><InputGroupText>%</InputGroupText></InputGroupAddon>
              </InputGroup>
            </Col>
          </Row>
          <p className="text-muted">A negative margin means you sell assets for less than what they are worth</p>
        </FormGroup>

        <h3>{t('marginSelectorForm.sellPrice')}</h3>
        <div className="border rounded p-3">
          1 {token.symbol} = {calcPrice.toFixed(4)} {currency}
        </div>
        <small>{t('marginSelectorForm.priceOrigin')}</small>

        {(fee || '0') !== '0' && <Fragment>
          <h3 className="mt-4">{t('marginSelectorForm.ourFee')}</h3>
          <div className="border rounded p-3">
            {web3.utils.fromWei(fee, 'ether')} SNT
          </div>
        </Fragment>}

        {!margin && margin !== 0 && <p className="text-muted mt-3">{t('marginSelectorForm.enterMargin')}</p>}
      </Form>
    );
  }
}

MarginSelectorForm.propTypes = {
  t: PropTypes.func,
  token: PropTypes.object,
  prices: PropTypes.object,
  fee: PropTypes.string,
  margin: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  currency: PropTypes.string,
  marginChange: PropTypes.func
};

export default withNamespaces()(MarginSelectorForm);
