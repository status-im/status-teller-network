import React, {Component} from 'react';
import {Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormGroup, Input, Label} from 'reactstrap';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import moment from 'moment';

import '../../../node_modules/react-datetime/css/react-datetime.css';

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
                   onChange={(e) => this.onChange(e, 'buyer')} value={buyer}/>
          </FormGroup>
          <FormGroup>
            <Label for="escrowValue">Value</Label>
            <Input type="number" name="escrowValue" id="escrowValue" placeholder="Value your are selling"
                   onChange={(e) => this.onChange(e, 'value')} value={value}/>
          </FormGroup>
          <FormGroup>
            <Label for="expiration">Value</Label>
            <Datetime value={expiration} onChange={(newDate) => this.onExpirationChange(newDate)} />
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
