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
import infoIcon from '../../../../../images/small-info.svg';
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
      <Form onSubmit={(e) => e.preventDefault()} ref={c => {
        this.form = c;
      }}>
        <h2 className="mb-4">{t('sellerMarginContainer.title')}</h2>

        {calcPrice !== null && <Fragment>
          <span>Selling Price</span>
          <p className="font-weight-bold">1 {token.symbol} = {calcPrice.toFixed(4)} {currency}</p>
        </Fragment>}
        {calcPrice === null && <p>{t('marginSelectorForm.noPrice')}</p>}

        <FormGroup className="mb-0">
          <Row>
            <Col md={9} sm={9} xs={8}>
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
        </FormGroup>


        <div className="infos-and-warnings mt-4">
          <Row noGutters>
            <Col>
              <RoundedIcon image={infoIcon} bgColor="secondary" size="sm" className="mr-2 float-left"/>
              <p className="info text-muted">A positive margin means you sell assets for more than they are worth.</p>
            </Col>
          </Row>
          <Row noGutters className="mt-1">
            <Col>
              <RoundedIcon image={infoIcon} bgColor="secondary" size="sm" className="mr-2 float-left"/>
              <p className="info text-muted">Sellers typically choose a margin of roughly 2% above the market price.</p>
            </Col>
          </Row>

        {(feeMilliPercent || '0') !== '0' && <Row noGutters className="mt-1">
            <Col>
              <RoundedIcon image={infoIcon} bgColor="secondary" size="sm" className="mr-2 float-left"/>
              <p className="info text-muted">Teller charges {feeMilliPercent / 1000}% of each transaction</p>
            </Col>
          </Row>}
          
          <Row noGutters className="mt-1">
            <Col>
              <RoundedIcon image={infoIcon} bgColor="secondary" size="sm" className="mr-2 float-left"/>
              <p className="info text-muted">Prices come from www.cryptocompare.com</p>
            </Col>
          </Row>
        </div>
      
      
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
