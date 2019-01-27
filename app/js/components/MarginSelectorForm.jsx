import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, FormFeedback, Label, InputGroup, InputGroupAddon} from 'reactstrap';
import Input from 'react-validation/build/input';
import '../../../node_modules/react-datetime/css/react-datetime.css';
import '../../css/Form.scss';
import {withNamespaces} from 'react-i18next';
import {withRouter, Link} from 'react-router-dom';
import classnames from 'classnames';
import Form from 'react-validation/build/form';
import {isInteger, required} from '../validators';

class MarginSelectorForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fiat: '',
      error: ''
    };
  }

  componentDidMount() {
    // Redirecting to previous step
    if(!this.props.fiat) this.props.history.push('/seller/fiat');
  }

  submit = () => {
    if(!this.validate()) return;    
    this.setState({error: ''});
    this.props.onSubmit(); 

    // TODO: redirect to next step 
    // this.props.history.push("/seller/contact");
  };

  validate() {
    /*const fiatError = !this.state.fiat;
    if (fiatError) {
      this.setState({ error: this.props.t("fiatSelectorForm.error")});
      return false;
    }*/
    return true;
  }

  render() {
    const {t, fiat} = this.props;
    const {error} = this.state;

    if(!fiat) return null;

    return ( 
      <Form ref={c => { this.form = c; }}>
        <FormGroup>
            <Label for="margin">{t('marginSelectorForm.margin')}</Label>
            <InputGroup>
              <Input type="text" name="margin" id="margin" placeholder="0" className="form-control"
                   onChange={(e) => this.onBuyerChange(e)} validations={[required, isInteger]} />
                   <InputGroupAddon addonType="append">%</InputGroupAddon>
            </InputGroup>
        </FormGroup>
        <FormGroup>
          <Label check>
            <Input type="radio" name="market" /> {t('marginSelectorForm.aboveMarket')}
          </Label>
          <Label check>
            <Input type="radio" name="market" /> {t('marginSelectorForm.belowMarket')}
          </Label>
        </FormGroup>

        <h3>{t('marginSelectorForm.sellPrice')}</h3>
        <div>
          1 ETH = 1,234,567.00 {fiat}
        </div>
        <small>{t('marginSelectorForm.priceOrigin')}</small>


        <h3>{t('marginSelectorForm.ourFee')}</h3>
        <div>
          1 SNT
        </div>

        <FormGroup>
          <FormFeedback className={classnames({'d-block': !!error})}>{error}</FormFeedback>
        </FormGroup>
        <Link to="/seller/fiat">Back</Link>
        <a onClick={this.submit}>{t("fiatSelectorForm.next")}</a>
      </Form>
    );
  }
}

MarginSelectorForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  history: PropTypes.object,
  onSubmit: PropTypes.func,
  fiat: PropTypes.string
};

export default withRouter(withNamespaces()(MarginSelectorForm));
