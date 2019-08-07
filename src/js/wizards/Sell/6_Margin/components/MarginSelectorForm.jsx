import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, InputGroup, InputGroupAddon, InputGroupText, Col, Row} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import {isNumber, required, lowerEqThan, higherThan} from '../../../../validators';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import './MarginSelectorForm.scss';
import infoIcon from '../../../../../images/info.svg';
import RoundedIcon from "../../../../ui/RoundedIcon";

class MarginSelectorForm extends Component {
  onMarginChange = (value) => {
    this.props.marginChange(value);
  };

  render() {
    let {t, currency, margin, token, prices, feeMilliPercent} = this.props;

    margin = parseInt(margin, 10);
    if(isNaN(margin)){
      margin = 0;
    }
    
    let calcPrice = null;
    if (prices && !prices.error) {
      const basePrice = prices[token.symbol][currency];
      const marginPrice = (margin || 0) / 100 * basePrice;
      calcPrice = basePrice + marginPrice;
    }

    return (
      <Form ref={c => {
        this.form = c;
      }}>
        <h2>{t('sellerMarginContainer.title')}</h2>
        <FormGroup className="mb-0">
          <Row>
            <Col md={9} sm={8} xs={7}>
              <Slider className="mb-3 p-4" min={-99} max={100} defaultValue={0}
                      onChange={(value) => this.onMarginChange(value)} value={margin}/>
            </Col>
            <Col>
              <InputGroup className="full-width-input margin-input">
                <Input type="number"
                       name="margin"
                       id="margin"
                       placeholder="0"
                       className="form-control prepend"
                       value={margin}
                       data-maxvalue={100}
                       data-minvalue={-100}
                       onChange={(e) => this.onMarginChange(e.target.value)}
                       validations={[required, isNumber, lowerEqThan, higherThan]}/>
                <InputGroupAddon addonType="append"><InputGroupText>%</InputGroupText></InputGroupAddon>
              </InputGroup>
            </Col>
          </Row>
          <p className="text-muted">A negative margin means you sell assets for less than what they are worth</p>
        </FormGroup>

        <h3>{t('marginSelectorForm.sellPrice')}</h3>
        {calcPrice !== null && <Fragment>
          <div className="border rounded p-3">
            1 {token.symbol} = {calcPrice.toFixed(4)} {currency}
          </div>
          <small>{t('marginSelectorForm.priceOrigin')}</small>
        </Fragment>}
        {calcPrice === null && <p>{t('marginSelectorForm.noPrice')}</p>}

        {(feeMilliPercent || '0') !== '0' && <div className="clearfix mt-5">
          <span className="float-left mr-3">
          < RoundedIcon image={infoIcon} bgColor="blue" />
          </span>
          {t('marginSelectorForm.ourFee', {percentage: feeMilliPercent / 1000})}
        </div>}

        {!margin && margin !== 0 && <p className="text-muted mt-4">{t('marginSelectorForm.enterMargin')}</p>}
      </Form>
    );
  }
}

MarginSelectorForm.propTypes = {
  t: PropTypes.func,
  token: PropTypes.object,
  prices: PropTypes.object,
  feeMilliPercent: PropTypes.string,
  margin: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  currency: PropTypes.string,
  marginChange: PropTypes.func
};

export default withNamespaces()(MarginSelectorForm);
