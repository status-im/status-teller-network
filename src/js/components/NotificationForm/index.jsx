import React, {Component} from "react";
import {Button, FormGroup, Label} from "reactstrap";
import InputValidated from "react-validation/build/input";
import {isEmail, required} from "../../validators";
import Form from "react-validation/build/form";
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";
import LoadingButton from "../../ui/LoadingButton";
import RoundedIcon from "../../ui/RoundedIcon";
import InfoRedIcon from "../../../images/info-red.svg";
import CheckIcon from "../../../images/green-check.svg";
import ModalDialog from "../ModalDialog";

class NotificationForm extends Component {
  state = {
    emailValid: false,
    email: '',
    hideWarning: false
  };

  changeEmail = (e) => {
    this.setState({
      email: e.target.value,
      emailValid: !isEmail(e.target.value) // isEmail returns an error on failure
    });
  };

  render() {
    const {t, working, subscribeSuccess, hideSuccess} = this.props;

    return (<Form className="mt-4" onSubmit={(e) => e.preventDefault()}>
      <FormGroup>
        <Label for="notification-email">Email</Label>
        <InputValidated type="email"
                        name="email"
                        id="notification-email"
                        placeholder="eg. vitalik94@ethereum.org"
                        className="form-control"
                        disabled={working}
                        value={this.state.email}
                        onChange={this.changeEmail}
                        validations={[required, isEmail]}/>
      </FormGroup>
      <p>
        <RoundedIcon bgColor="red" image={InfoRedIcon} size="md" className="float-left mr-2"/>
        <span className="text-muted">{t('notificationSettings.infoWarning')}</span>
      </p>
      <div className="text-center">
        {!working &&
        <Button color="primary" onClick={() => this.props.subscribe(this.state.email)} disabled={!this.state.emailValid}>
          {t('notificationSettings.saveButton')}
        </Button>}

        {working && <LoadingButton/>}
      </div>

      <ModalDialog display={subscribeSuccess} buttonText={t('notificationSettings.ok')}
                   onClose={hideSuccess} onClick={hideSuccess}>
        <RoundedIcon image={CheckIcon} bgColor="green"/>
        <h3>{t('notificationSettings.checkEmail')}</h3>
      </ModalDialog>
    </Form>);
  }
}

NotificationForm.propTypes = {
  t: PropTypes.func,
  working: PropTypes.bool,
  subscribeSuccess: PropTypes.bool,
  hideSuccess: PropTypes.func,
  subscribe: PropTypes.func
};


export default withTranslation()(NotificationForm);
