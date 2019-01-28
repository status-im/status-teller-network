import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Label, InputGroup, InputGroupAddon, Alert} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import {withRouter} from 'react-router-dom';
import Form from 'react-validation/build/form';
import {isInteger, required} from '../validators';

class MarginSelectorForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      marketError: '',
      isAbove: props.margin.isAbove,
      rate: props.margin.rate
    };

    // Redirecting to previous step
    if(!props.fiat) this.props.history.push('/seller/fiat');
  }

  onRadioButtonChange = (e) => {
    this.setState({isAbove: e.target.value === "above"});
  }

  onInputChange = (e) => {
    this.setState({rate: e.target.value});
  }

  _submit(address){
    if(!this.validate()) return;    
    this.props.onSubmit(parseInt(this.state.rate, 10), this.state.isAbove); 
    this.props.history.push(address);
  }

  back = () => {
    this.props.history.push("/seller/fiat");
  }

  continue = () => {
    // TODO: redirect to next step 
    this._submit("/seller/margin");
  };

  validate() {
    this.setState({error: '', marketError: ''});

    this.form.validateAll();
    if (this.form.getChildContext()._errors.length > 0) {
      this.setState({error: this.props.t('marginSelectorForm.error')});
      return false;
    }

    this.setState({error: ''});
    return true;
  }

  render() {
    const {t, fiat} = this.props;
    const {error, rate, isAbove} = this.state;

    if(!fiat) return null;

    return ( 
      <Form ref={c => { this.form = c; }}>
        {error && <Alert color="danger">{error}</Alert>}
        <FormGroup>
            <Label for="rate">{t('marginSelectorForm.margin')}</Label>
            <InputGroup>
              <Input type="text" name="rate" id="rate" placeholder="0" className="form-control"
                  value={rate} onChange={this.onInputChange} validations={[required, isInteger]} />
              <InputGroupAddon addonType="append">%</InputGroupAddon>
            </InputGroup>
        </FormGroup>
        <FormGroup>
          <Label check>
            <Input type="radio" name="market" value="above" onChange={this.onRadioButtonChange} checked={isAbove} /> {t('marginSelectorForm.aboveMarket')}
          </Label>
          <Label check>
            <Input type="radio" name="market" value="below" onChange={this.onRadioButtonChange} checked={!isAbove} /> {t('marginSelectorForm.belowMarket')}
          </Label>
        </FormGroup>

        <h3>{t('marginSelectorForm.sellPrice')}</h3>
        <div>
          1 TODO = 1,234.00 {fiat}
        </div>
        <small>{t('marginSelectorForm.priceOrigin')}</small>


        <h3>{t('marginSelectorForm.ourFee')}</h3>
        <div>
          TODO SNT
        </div>

        <a onClick={this.back}>{t("marginSelectorForm.back")}</a>
        <br />
        <a onClick={this.continue}>{t("marginSelectorForm.continue")}</a>
      </Form>
    );
  }
}

MarginSelectorForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  history: PropTypes.object,
  margin: PropTypes.object,
  onSubmit: PropTypes.func,
  fiat: PropTypes.string
};

export default withRouter(withNamespaces()(MarginSelectorForm));
