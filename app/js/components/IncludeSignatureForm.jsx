import React, {Component} from 'react';
import {Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, FormGroup, Input, Label} from 'reactstrap';
import PropTypes from 'prop-types';

class IncludeSignatureForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signature: '{}'
    };
  }

  onChange(e, field) {
    let data = e.target.value;
    this.setState({[field]: data});
  }

  submit = () => {
    // TODO add validation before submitting
    this.props.onSubmit(JSON.parse(this.state.signature));
  };

  render() {
    return <Card className="mt-2">
      <CardHeader>
        <CardTitle>Include Signature</CardTitle>
      </CardHeader>
      <CardBody>
        <Form>
          {this.props.error &&
          <Alert color="danger">Error while executing the transaction: {this.props.error}</Alert>}
          {this.props.result &&
          <Alert color="success">Receipt: <pre>{JSON.stringify(this.props.result, null, 2)}</pre></Alert>}
          <FormGroup>
            <Label for="signature">Signature</Label>
            <Input type="textarea" name="escrowValue" id="escrowValue" placeholder="Message"
                   onChange={(e) => this.onChange(e, 'signature')} value={this.state.signature}/>
          </FormGroup>
          <Button onClick={this.submit}>Submit</Button>
        </Form>
      </CardBody>
    </Card>;
  }
}

IncludeSignatureForm.propTypes = {
  error: PropTypes.string,
  result: PropTypes.object,
  onSubmit: PropTypes.func
};

export default IncludeSignatureForm;
