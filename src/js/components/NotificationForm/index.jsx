import {Button, FormGroup, Label} from "reactstrap";
import Input from "react-validation/build/input";
import {isEmail, required} from "../../validators";
import Form from "react-validation/build/form";
import React, {Component} from "react";
import PropTypes from "prop-types";
import {withNamespaces} from "react-i18next";

class NotificationForm extends Component {
  state = {
    emailValid: false,
    email: ''
  };

  changeEmail = (e) => {
    this.setState({
      email: e.target.value,
      emailValid: !isEmail(e.target.value) // isEmail returns an error on failure
    });
  };

  render() {
    const {t, disabled, subscribe} = this.props;

    return (<Form className="mt-4" onSubmit={(e) => e.preventDefault()}>
      <FormGroup>
        <Label for="notification-email">Email</Label>
        <Input type="email"
               name="email"
               id="notification-email"
               placeholder="eg. vitalik94@ethereum.org"
               className="form-control"
               value={this.state.email}
               onChange={this.changeEmail}
               validations={[required, isEmail]}/>
      </FormGroup>
      <div className="text-center">
        <Button color="primary" onClick={() => subscribe(this.state.email)} disabled={disabled || !this.state.emailValid}>
          {t('notificationSettings.saveButton')}
        </Button>
      </div>
    </Form>);
  }
}

NotificationForm.propTypes = {
  t: PropTypes.func,
  disabled: PropTypes.bool,
  subscribe: PropTypes.func
};

export default withNamespaces()(NotificationForm);
