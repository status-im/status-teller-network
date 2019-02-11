import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader, CardTitle, FormGroup, Label} from 'reactstrap';
import PropTypes from 'prop-types';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {withNamespaces} from "react-i18next";
import {isJSON, required, isEscrowPaymentSignature} from "../../validators";
import TransactionResults from "./TransactionResults";

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
    const {t, loading, error, receipt, txHash} = this.props;
    return <Card className="mt-2">
      <CardHeader>
        <CardTitle>Include Signature</CardTitle>
      </CardHeader>
      <CardBody>
        <Form ref={c => { this.form = c; }}>
          <TransactionResults txHash={txHash} loading={loading} error={error || this.state.error} result={receipt} resultText={"Receipt:"}
                              loadingText={t('signatureForm.paying')} errorText={"Error while executing the transaction: "}/>
          <FormGroup>
            <Label for="signature">Signature</Label>
            <Input type="textarea" name="escrowValue" id="escrowValue" placeholder="{}" className="form-control"
                   onChange={(e) => this.onChange(e, 'signature')} value={this.state.signature}
                   validations={[required, isJSON, isEscrowPaymentSignature]} disabled={loading}/>
          </FormGroup>
          <Button onClick={this.submit} disabled={loading}>Submit</Button>
        </Form>
      </CardBody>
    </Card>;
  }
}

IncludeSignatureForm.propTypes = {
  error: PropTypes.string,
  txHash: PropTypes.string,
  receipt: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func,
  t: PropTypes.func
};

export default withNamespaces()(IncludeSignatureForm);
