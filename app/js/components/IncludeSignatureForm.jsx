import React, {Component} from 'react';
import {Alert, Button, Card, CardBody, CardHeader, CardTitle, FormGroup, Label} from 'reactstrap';
import PropTypes from 'prop-types';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {isJSON, required, isEscrowPaymentSignature} from "../validators";

class IncludeSignatureForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signature: '',
      error: ''
    };
  }

  onChange(e, field) {
    let data = e.target.value;
    this.setState({[field]: data});
  }

  submit = () => {
    this.form.validateAll();
    if (this.form.getChildContext()._errors.length > 0) {
      return this.setState({error: 'Please fix issues before submitting'});
    }
    this.setState({error: ''});
    this.props.onSubmit(JSON.parse(this.state.signature));
  };

  render() {
    return <Card className="mt-2">
      <CardHeader>
        <CardTitle>Include Signature</CardTitle>
      </CardHeader>
      <CardBody>
        <Form ref={c => { this.form = c; }}>
          {(this.props.error || this.state.error) &&
          <Alert color="danger">Error while executing the transaction: {this.props.error || this.state.error}</Alert>}
          {this.props.receipt &&
          <Alert color="success">Receipt: <pre>{JSON.stringify(this.props.receipt, null, 2)}</pre></Alert>}
          <FormGroup>
            <Label for="signature">Signature</Label>
            <Input type="textarea" name="escrowValue" id="escrowValue" placeholder="{}" className="form-control"
                   onChange={(e) => this.onChange(e, 'signature')} value={this.state.signature}
                   validations={[required, isJSON, isEscrowPaymentSignature]}/>
          </FormGroup>
          <Button onClick={this.submit}>Submit</Button>
        </Form>
      </CardBody>
    </Card>;
  }
}

IncludeSignatureForm.propTypes = {
  error: PropTypes.string,
  receipt: PropTypes.object,
  onSubmit: PropTypes.func
};

export default IncludeSignatureForm;
