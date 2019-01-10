import React, {Component} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import PropTypes from 'prop-types';

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function toInputDate(date) {
  return date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate()) +
    'T' + pad(date.getUTCHours()) +
    ':' + pad(date.getUTCMinutes());
}

class CreateEscrowForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      expiration: new Date(),
      buyer: ''
    };
  }

  onChange(e, field) {
    let data = e.target.value;
    if (field === 'expiration') {
      data = new Date(e.target.value);
    }
    this.setState({[field]: data});
  }

  submit = () => {
    this.props.create(this.state.buyer, this.state.value, this.state.expiration.getTime());
  };

  render() {
    return <Form>
      <h2>Create an Escrow</h2>
      <FormGroup>
        <Label for="buyer">Value</Label>
        <Input type="text" name="buyer" id="buyer" placeholder="Address of the buyer"
               onChange={(e) => this.onChange(e, 'buyer')} value={this.state.buyer}/>
      </FormGroup>
      <FormGroup>
        <Label for="escrowValue">Value</Label>
        <Input type="number" name="escrowValue" id="escrowValue" placeholder="Value your are selling"
               onChange={(e) => this.onChange(e, 'value')} value={this.state.value}/>
      </FormGroup>
      <FormGroup>
        <Label for="expiration">Value</Label>
        <Input type="datetime-local" name="expiration" id="expiration"
               onChange={(e) => this.onChange(e, 'expiration')} value={toInputDate(this.state.expiration)}/>
      </FormGroup>
      <Button onClick={this.submit}>Submit</Button>
    </Form>;
  }
}

CreateEscrowForm.propTypes = {
  create: PropTypes.func
};

export default CreateEscrowForm;
