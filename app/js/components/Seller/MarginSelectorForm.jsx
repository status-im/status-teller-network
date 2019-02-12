import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Label, InputGroup, InputGroupAddon, ButtonGroup, Button, InputGroupText} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import {isNumber, required} from '../../validators';
import MarketButton from '../ui/MarketButton';

const ABOVE = 1;
const BELOW = -1;

class MarginSelectorForm extends Component {

  render() {
    const {t, currency, margin, marketType} = this.props;

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
                     onChange={(e) => this.marginChange(e.target.value)}
                     validations={[required, isNumber]} />
              <InputGroupAddon addonType="append"><InputGroupText>%</InputGroupText></InputGroupAddon>
            </InputGroup>
        </FormGroup>
        <FormGroup>
          <ButtonGroup className="d-flex">
            <MarketButton onClick={() => this.marketTypeChange(0)} active={marketType === 0}>
              {t('marginSelectorForm.aboveMarket')}
            </MarketButton>
            <MarketButton onClick={() => this.marketTypeChange(1)} active={marketType === 1}>
              {t('marginSelectorForm.belowMarket')}
            </MarketButton>
          </ButtonGroup>
        </FormGroup>

        <h3>{t('marginSelectorForm.sellPrice')}</h3>
        <div>
          1 TODO = 1,234.00 {currency}
        </div>
        <small>{t('marginSelectorForm.priceOrigin')}</small>

        <h3>{t('marginSelectorForm.ourFee')}</h3>
        <div>
          TODO SNT
        </div>

        {!this.props.margin && this.props.margin !== 0 && <p className="text-info">{t('marginSelectorForm.enterMargin')}</p>}
      </Form>
    );
  }
}

MarginSelectorForm.propTypes = {
  t: PropTypes.func,
  margin: PropTypes.number,
  marketType: PropTypes.number,
  currency: PropTypes.string,
  marginChange: PropTypes.func,
  marketTypeChange: PropTypes.func
};

export default withNamespaces()(MarginSelectorForm);
