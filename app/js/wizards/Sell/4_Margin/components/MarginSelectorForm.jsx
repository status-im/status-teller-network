import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Label, InputGroup, InputGroupAddon, ButtonGroup, InputGroupText} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import {isNumber, required, lowerThan} from '../../validators';
import MarketButton from '../ui/MarketButton';

const ABOVE = 0;
const BELOW = 1;

class MarginSelectorForm extends Component {

  render() {
    const {t, currency, margin, marketType, token, prices} = this.props;

    const basePrice = prices[token.symbol][currency];
    const marginPrice = (margin || 0) / 100 * basePrice;
    const calcPrice = basePrice + (marketType === ABOVE ? marginPrice : -marginPrice);

    return (
      <Form ref={c => { this.form = c; }}>
        <h2>{t('sellerMarginContainer.title')}</h2>
        <FormGroup>
            <Label for="margin">{t('marginSelectorForm.margin')}</Label>
            <InputGroup className="full-width-input">
              <Input type="number"
                     name="margin"
                     id="margin"
                     placeholder="0"
                     className="form-control prepend"
                     value={margin}
                     onChange={(e) => this.props.marginChange(e.target.value)}
                     validations={[required, isNumber, lowerThan.bind(null, 100)]} />
              <InputGroupAddon addonType="append"><InputGroupText>%</InputGroupText></InputGroupAddon>
            </InputGroup>
        </FormGroup>
        <FormGroup>
          <ButtonGroup className="d-flex">
            <MarketButton onClick={() => this.props.marketTypeChange(ABOVE)} active={marketType === ABOVE}>
              {t('marginSelectorForm.aboveMarket')}
            </MarketButton>
            <MarketButton onClick={() => this.props.marketTypeChange(BELOW)} active={marketType === BELOW}>
              {t('marginSelectorForm.belowMarket')}
            </MarketButton>
          </ButtonGroup>
        </FormGroup>

        <h3>{t('marginSelectorForm.sellPrice')}</h3>
        <div className="border rounded p-3">
          1 {token.symbol} = {calcPrice.toFixed(4)} {currency}
        </div>
        <small>{t('marginSelectorForm.priceOrigin')}</small>

        <h3>{t('marginSelectorForm.ourFee')}</h3>
        <div className="border rounded p-3">
          TODO SNT
        </div>

        {!this.props.margin && this.props.margin !== 0 && <p className="text-muted mt-3">{t('marginSelectorForm.enterMargin')}</p>}
      </Form>
    );
  }
}

MarginSelectorForm.propTypes = {
  t: PropTypes.func,
  token: PropTypes.object,
  prices: PropTypes.object,
  margin: PropTypes.number,
  marketType: PropTypes.number,
  currency: PropTypes.string,
  marginChange: PropTypes.func,
  marketTypeChange: PropTypes.func
};

export default withNamespaces()(MarginSelectorForm);
