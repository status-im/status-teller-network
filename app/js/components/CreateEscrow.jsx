import React, {Component} from 'react';
import {Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormGroup, Input, Label} from 'reactstrap';
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
    // TODO add validation before submitting
    this.props.create(this.state.buyer, this.state.value, this.state.expiration.getTime());
  };

  render() {
    return <Card className="mt-2">
      <CardHeader>
        <CardTitle>Create an Escrow</CardTitle>
      </CardHeader>
      <CardBody>
        <Form>
          {this.props.error &&
          <Alert color="danger">Error while creating the escrow: {this.props.error}</Alert>}
          {this.props.result &&
          <Alert color="success">Escrow receipt: <pre>{JSON.stringify(this.props.result, null, 2)}</pre></Alert>}
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
        </Form>
      </CardBody>
    </Card>;
  }
}

CreateEscrowForm.propTypes = {
  create: PropTypes.func,
  error: PropTypes.string,
  result: PropTypes.object
};

export default CreateEscrowForm;
