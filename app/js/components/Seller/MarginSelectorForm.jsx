import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Label, InputGroup, InputGroupAddon, ButtonGroup, Button, InputGroupText} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import {isNumber, required} from '../../validators';

const ABOVE = 1;
const BELOW = -1;

class MarginSelectorForm extends Component {
  changeAboveOrBelow = (value) => {
    this.props.onMarginChange({isAbove: value === ABOVE});
  };

  onInputChange = (e) => {
    this.props.onMarginChange({rate: e.target.value});
  };

  render() {
    const {t, fiat, margin} = this.props;

    return (
      <Form ref={c => { this.form = c; }}>
        <h2>{t('sellerMarginContainer.title')}</h2>
        <FormGroup>
            <Label for="margin">{t('marginSelectorForm.margin')}</Label>
            <InputGroup className="full-width-input">
              <Input type="number" name="margin" id="margin" placeholder="0" className="form-control prepend"
                  value={margin.rate} onChange={this.onInputChange} validations={[required, isNumber]} />
              <InputGroupAddon addonType="append"><InputGroupText>%</InputGroupText></InputGroupAddon>
            </InputGroup>
        </FormGroup>
        <FormGroup>
          <ButtonGroup className="asset-btns market-btns">
            <Button onClick={() => this.changeAboveOrBelow(ABOVE)} active={margin.isAbove}>
              {t('marginSelectorForm.aboveMarket')}
            </Button>
            <Button onClick={() => this.changeAboveOrBelow(BELOW)} active={!margin.isAbove}>
              {t('marginSelectorForm.belowMarket')}
            </Button>
          </ButtonGroup>
        </FormGroup>

        <h3>{t('marginSelectorForm.sellPrice')}</h3>
        <div>
          1 TODO = 1,234.00 {fiat.id}
        </div>
        <small>{t('marginSelectorForm.priceOrigin')}</small>

        <h3>{t('marginSelectorForm.ourFee')}</h3>
        <div>
          TODO SNT
        </div>

        {!this.props.margin.rate && this.props.margin.rate !== 0 && <p className="text-info">{t('marginSelectorForm.enterMargin')}</p>}
      </Form>
    );
  }
}

MarginSelectorForm.propTypes = {
  t: PropTypes.func,
  margin: PropTypes.object,
  fiat: PropTypes.object,
  onMarginChange: PropTypes.func
};

export default withNamespaces()(MarginSelectorForm);
