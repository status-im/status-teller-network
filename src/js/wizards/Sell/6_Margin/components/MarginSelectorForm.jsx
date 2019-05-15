/* global web3 */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, InputGroup, InputGroupAddon, ButtonGroup, InputGroupText} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import CheckButton from '../../../../ui/CheckButton';
import {isNumber, required, lowerThan} from '../../../../validators';

const ABOVE = 0;
const BELOW = 1;

class MarginSelectorForm extends Component {

  render() {
    const {t, currency, margin, marketType, token, prices, fee} = this.props;

    const basePrice = prices[token.symbol][currency];
    const marginPrice = (margin || 0) / 100 * basePrice;
    const calcPrice = basePrice + (marketType === ABOVE ? marginPrice : -marginPrice);

    return (
      <Form ref={c => { this.form = c; }}>
        <h2>{t('sellerMarginContainer.title')}</h2>
        <FormGroup className="mb-0">
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
          <ButtonGroup vertical className="w-100 marginSelector mb-0">
            <CheckButton active={marketType === ABOVE}
                         onClick={() => this.props.marketTypeChange(ABOVE)}>
              {t('marginSelectorForm.aboveMarket')}
            </CheckButton>
            <CheckButton active={marketType === BELOW}
                         onClick={() => this.props.marketTypeChange(BELOW)}>
              {t('marginSelectorForm.belowMarket')}
            </CheckButton>
          </ButtonGroup>
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

        {!this.props.margin && this.props.margin !== 0 && <p className="text-muted mt-3">{t('marginSelectorForm.enterMargin')}</p>}
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
