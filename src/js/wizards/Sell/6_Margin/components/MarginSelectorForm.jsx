/* global web3 */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, InputGroup, InputGroupAddon, InputGroupText, Col, Row} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import {isNumber, required, lowerThan} from '../../../../validators';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import './MarginSelectorForm.scss';

const ABOVE = 0;
const BELOW = 1;

class MarginSelectorForm extends Component {
  onMarginChange = (value) => {
    if (value < 0) {
      if (this.props.marketType === ABOVE) {
        this.props.marketTypeChange(BELOW);
      }
      value *= -1;
    } else {
      if (this.props.marketType === BELOW) {
        this.props.marketTypeChange(ABOVE);
      }
    }
    this.props.marginChange(value);
  };

  render() {
    const {t, currency, margin, marketType, token, prices, fee} = this.props;

    const basePrice = prices[token.symbol][currency];
    const marginPrice = (margin || 0) / 100 * basePrice;
    const calcPrice = basePrice + (marketType === ABOVE ? marginPrice : -marginPrice);
    const adjustedMargin = (marketType === ABOVE) ? margin : margin * -1;

    return (
      <Form ref={c => {
        this.form = c;
      }}>
        <h2>{t('sellerMarginContainer.title')}</h2>
        <FormGroup className="mb-0">
          <Row>
            <Col xs={9}>
              <Slider className="mb-3 p-4" min={-100} max={100} defaultValue={0}
                      onChange={(value) => this.onMarginChange(value)} value={adjustedMargin}/>
            </Col>
            <Col>
              <InputGroup className="full-width-input">
                <Input type="number"
                       name="margin"
                       id="margin"
                       placeholder="0"
                       className="form-control prepend"
                       value={adjustedMargin}
                       onChange={(e) => this.onMarginChange(e.target.value)}
                       validations={[required, isNumber, lowerThan.bind(null, 100)]}/>
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
  marketType: PropTypes.number,
  currency: PropTypes.string,
  marginChange: PropTypes.func,
  marketTypeChange: PropTypes.func
};

export default withNamespaces()(MarginSelectorForm);
