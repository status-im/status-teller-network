import React, {Component} from "react";
import {Button, FormGroup, Label, Input} from "reactstrap";
import InputValidated from "react-validation/build/input";
import {isEmail, required} from "../../validators";
import Form from "react-validation/build/form";
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";
import LoadingButton from "../../ui/LoadingButton";
import RoundedIcon from "../../ui/RoundedIcon";
import InfoRedIcon from "../../../images/info-red.svg";
import PencilIcon from "../../../images/pencil.svg";
import CheckIcon from "../../../images/green-check.svg";
import ModalDialog from "../ModalDialog";
import {connect} from "react-redux";
import emailNotifications from "../../features/emailNotifications";

class NotificationForm extends Component {
  state = {
    emailValid: false,
    email: '',
    showDialog: false,
    hideWarning: false
  };

  changeEmail = (e) => {
    this.setState({
      email: e.target.value,
      emailValid: !isEmail(e.target.value) // isEmail returns an error on failure
    });
  };

  subscribeOrShowModal() {
    if (this.props.hideSignatureWarning) {
      return this.props.subscribe();
    }
    this.setState({showDialog: true});
  }

  render() {
    const {t, working, subscribe, subscribeSuccess, hideSuccess} = this.props;

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
        <Button color="primary" onClick={() => this.subscribeOrShowModal()} disabled={!this.state.emailValid}>
          {t('notificationSettings.saveButton')}
        </Button>}

        {working && <LoadingButton/>}
      </div>

      <ModalDialog display={this.state.showDialog} buttonText={t('notificationSettings.signWithWallet')}
                   onClose={() => this.setState({showDialog: false})} onClick={() => {
        subscribe(this.state.email);
        this.props.setHideSignatureWarning(this.state.hideWarning);
        this.setState({showDialog: false});
      }}>
        <RoundedIcon image={PencilIcon} bgColor="blue"/>
        <h3>{t('notificationSettings.walletSignature')}</h3>
        <p className="text-muted">{t('notificationSettings.willAskToSign')}</p>
        <FormGroup check>
          <Label check>
            <Input type="checkbox" onChange={(e) => this.setState({hideWarning: e.target.checked})}/>
            {t('notificationSettings.dontShowAgain')}
          </Label>
        </FormGroup>
      </ModalDialog>

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
  hideSignatureWarning: PropTypes.bool,
  hideSuccess: PropTypes.func,
  subscribe: PropTypes.func,
  setHideSignatureWarning: PropTypes.func
};

const mapStateToProps = (state) => ({
  hideSignatureWarning: emailNotifications.selectors.hideSignatureWarning(state)
});

export default connect(
  mapStateToProps,
  {
    setHideSignatureWarning: emailNotifications.actions.setHideSignatureWarning
  }
)(withTranslation()(NotificationForm));
