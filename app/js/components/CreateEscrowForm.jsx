import React, {Component} from 'react';
import {Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormGroup, Input, Label} from 'reactstrap';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import moment from 'moment';
import '../../../node_modules/react-datetime/css/react-datetime.css';
import {withNamespaces} from 'react-i18next';

class CreateEscrowForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      expiration: moment(),
      buyer: ''
    };
  }

  onChange(e, field) {
    let data = e.target.value;
    this.setState({[field]: data});
  }

  onExpirationChange(newDate) {
    this.setState({expiration: newDate});
  }

  submit = () => {
    // TODO add validation before submitting
    this.props.create(this.state.buyer, this.state.value, this.state.expiration.unix());
  };

  render() {
    const {expiration, buyer, value} = this.state;
    const {t} = this.props;
    return <Card className="mt-2">
      <CardHeader>
        <CardTitle>{t('createEscrowFrom.title')}</CardTitle>
      </CardHeader>
      <CardBody>
        <Form>
          {this.props.error &&
          <Alert color="danger">{t('createEscrowFrom.error')} {this.props.error}</Alert>}
          {this.props.result &&
          <Alert color="success">{t('createEscrowFrom.receipt')} <pre>{JSON.stringify(this.props.result, null, 2)}</pre></Alert>}
          <FormGroup>
            <Label for="buyer">{t('createEscrowFrom.value')}</Label>
            <Input type="text" name="buyer" id="buyer" placeholder="Address of the buyer"
                   onChange={(e) => this.onChange(e, 'buyer')} value={buyer}/>
          </FormGroup>
          <FormGroup>
            <Label for="escrowValue">{t('createEscrowFrom.value')}</Label>
            <Input type="number" name="escrowValue" id="escrowValue" placeholder="Value your are selling"
                   onChange={(e) => this.onChange(e, 'value')} value={value}/>
          </FormGroup>
          <FormGroup>
            <Label for="expiration">{t('createEscrowFrom.value')}</Label>
            <Datetime value={expiration} onChange={(newDate) => this.onExpirationChange(newDate)} />
          </FormGroup>
          <Button onClick={this.submit}>{t('createEscrowFrom.submit')}</Button>
        </Form>
      </CardBody>
    </Card>;
  }
}

CreateEscrowForm.propTypes = {
  t: PropTypes.func,
  create: PropTypes.func,
  error: PropTypes.string,
  result: PropTypes.object
};

export default withNamespaces()(CreateEscrowForm);
