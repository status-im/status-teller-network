import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, FormFeedback} from 'reactstrap';
import {Typeahead} from 'react-bootstrap-typeahead';
import '../../../node_modules/react-datetime/css/react-datetime.css';
import '../../css/Form.scss';
import {withNamespaces} from 'react-i18next';
import {withRouter} from 'react-router-dom';
import classnames from 'classnames';

// TODO: where will this FIAT currency list come from? 
//       cryptocompare does not identify which currencies are FIAT
//       and it does not have a full list of FIAT currencies
const CURRENCY_DATA = [
  {id: 'USD', label: 'United States Dollar - USD'},
  {id: 'EUR', label: 'Euro - EUR'},
  {id: 'GBP', label: 'Pound sterling - GBP'},
  {id: 'JPY', label: 'Japanese Yen - JPY'},
  {id: 'CNY', label: 'Chinese Yuan - CNY'},
  {id: 'KRW', label: 'South Korean Won - KRW'}
];

class FiatSelectorForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fiat: '',
      error: ''
    };
  }

  componentDidMount(){
    if(this.props.value) this.setState({ fiat: this.props.value });
  }

  onInputChange = (text) => {
    const symbol = CURRENCY_DATA.find(x => x.label === text);
    this.setState({fiat: symbol || '', error: ''});
  }

  onChange = (items) => {
    if(items.length){
      const item = items[0];
      this.setState({fiat: item.id, error: ''});
    } else {
      this.setState({fiat: '', error: ''});
    }
  }

  submit = () => {
    if(!this.validate()) return;    
    this.setState({error: ''});
    this.props.onSubmit(this.state.fiat);  
    this.props.history.push("/seller/margin");
  };

  validate() {
    const fiatError = !this.state.fiat;
    if (fiatError) {
      this.setState({ error: this.props.t("fiatSelectorForm.error")});
      return false;
    }
    return true;
  }

  render() {
    const {t, value} = this.props;
    const {error} = this.state;

    const defaultSelectedValue = value ? [CURRENCY_DATA.find(x => x.id === value)] : [];

    return ( 
      <Fragment>
        <FormGroup>
          <Typeahead
            onChange={this.onChange}
            options={CURRENCY_DATA}
            placeholder={t("fiatSelectorForm.placeholder")}
            isInvalid={!!error}
            onInputChange={this.onInputChange}
            submitFormOnEnter={true}
            emptyLabel={t("fiatSelectorForm.emptyLabel")}
            defaultSelected={defaultSelectedValue}
          />
          <FormFeedback className={classnames({'d-block': !!error})}>{error}</FormFeedback>
        </FormGroup>
        <a onClick={this.submit}>{t("fiatSelectorForm.next")}</a>
      </Fragment>
    );
  }
}

FiatSelectorForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  history: PropTypes.object,
  onSubmit: PropTypes.func,
  value: PropTypes.string
};

export default withRouter(withNamespaces()(FiatSelectorForm));
