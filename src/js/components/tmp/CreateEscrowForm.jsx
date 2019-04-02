import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader, CardTitle, FormGroup, Label, FormFeedback} from 'reactstrap';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import moment from 'moment';
import classnames from 'classnames';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {isInteger, isAddress, required} from '../../validators';
import TransactionResults from './TransactionResults';

import '../../../../node_modules/react-datetime/css/react-datetime.css';
import '../../../css/Form.scss';

class CreateEscrowForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      expiration: moment(Date.now() + (15 * 60 * 1000)),
      buyer: '',
      expirationError: '',
      error: ''
    };
  }

  onBuyerChange(e) {
    this.setState({buyer: e.target.value});
  }

  onAmountChange(e) {
    this.setState({amount: e.target.value});
  }

  validateExpiration(expiration) {
    let error = '';
    if (!expiration.unix()) { // Somehow, the user managed to return NOT a moment date
      error = 'Expiration is not a valid date object. Please use the Date Picker.';
    }
    if (expiration.unix() < moment().unix() + 600) {
      error = 'Expiration date needs to be in at least 10 minutes';
    }
    this.setState({expirationError: error});
    return error;
  }

  onExpirationChange(newDate) {
    this.validateExpiration(newDate);
    this.setState({expiration: newDate});
  }

  submit = () => {
    this.form.validateAll();
    const expirationError = this.validateExpiration(this.state.expiration);
    if (this.form.getChildContext()._errors.length > 0 || expirationError) {
      return this.setState({error: 'Please fix issues before submitting'});
    }
    this.setState({error: ''});

    this.props.create(this.state.buyer, this.state.amount, this.state.expiration.unix());
  };

  render() {
    const {expiration, buyer, amount, expirationError, error} = this.state;
    const {t, isLoading, result, error: propsError, txHash} = this.props;
    return <Card className="mt-2">
      <CardHeader>
        <CardTitle>{t('createEscrowFrom.title')}</CardTitle>
      </CardHeader>
      <CardBody>
        <Form ref={c => { this.form = c; }}>
          <TransactionResults txHash={txHash} loading={isLoading} error={propsError || error} result={result} errorText={t('createEscrowFrom.error')}
                              loadingText={t('createEscrowFrom.creating')} resultText={t('createEscrowFrom.receipt')}/>
          <FormGroup>
            <Label for="buyer">{t('createEscrowFrom.buyer')}</Label>
            <Input type="text" name="buyer" id="buyer" placeholder="Address of the buyer" className="form-control"
                   onChange={(e) => this.onBuyerChange(e)} value={buyer} validations={[required, isAddress]} disabled={isLoading}/>
          </FormGroup>
          <FormGroup>
            <Label for="amount">{t('createEscrowFrom.amount')}</Label>
            <Input type="number" name="amount" id="amount" placeholder="Amount your are selling" className="form-control"
                   onChange={(e) => this.onAmountChange(e)} value={amount} validations={[required, isInteger]} disabled={isLoading}/>
          </FormGroup>
          <FormGroup>
            <Label for="expiration">{t('createEscrowFrom.expiration')}</Label>
            <Datetime inputProps={{className: classnames({'is-invalid': !!expirationError, 'form-control': true}), disabled:isLoading}}
                      value={expiration} onChange={(newDate) => this.onExpirationChange(newDate)}/>
            <FormFeedback className={classnames({'d-block': !!expirationError})}>{expirationError}</FormFeedback>
          </FormGroup>
          <Button onClick={this.submit} disabled={isLoading}>{t('createEscrowFrom.submit')}</Button>
        </Form>
      </CardBody>
    </Card>;
  }
}

CreateEscrowForm.propTypes = {
  t: PropTypes.func,
  create: PropTypes.func,
  error: PropTypes.string,
  result: PropTypes.object,
  isLoading: PropTypes.bool,
  txHash: PropTypes.string
};

export default withNamespaces()(CreateEscrowForm);
