import React, {Component, Fragment} from "react";
import {withNamespaces} from "react-i18next";
import PropTypes from "prop-types";
import {Alert} from 'reactstrap';
import Switch from "react-switch";
import {connect} from "react-redux";
import emailNotifications from '../../features/emailNotifications';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import NotificationForm from "../../components/NotificationForm";

class NotificationSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEmailSection: props.isSubscribed
    };
    this.props.checkSubscription();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isSubscribed !== this.props.isSubscribed) {
      this.setState({showEmailSection: this.props.isSubscribed});
    }
    // TODO find a way to retrieve the email
  }

  changeNotificationParam = (checked) => {
    this.setState({showEmailSection: checked});
    if (checked === false && this.props.isSubscribed) {
      this.props.unsubscribe();
    }
  };

  hideError = () => {
    this.props.hideError();
  };

  hideSuccess = () => {
    this.props.hideSuccess();
  };

  subscribe = (email) => {
    this.props.subscribe(email);
  };

  render() {
    const {t, working, error, subscribeSuccess} = this.props;

    return (<Fragment>
      <h2 className="mb-4 mt-3">{t('notificationSettings.title')}</h2>
      {error && <Alert color="danger" toggle={this.hideError}>Error: {error}</Alert>}
      {subscribeSuccess && <Alert color="success" toggle={this.hideSuccess}>Success subscribing. Please check your emails to verify your subscription</Alert>}
      {working && <Fragment>Loading... <FontAwesomeIcon icon={faCircleNotch} spin/></Fragment>}
      <div>
        {t('notificationSettings.emailSwitcher')}
        {typeof this.state.showEmailSection === 'boolean' && <Switch onChange={this.changeNotificationParam}
                checked={this.state.showEmailSection}
                className="float-right"
                onColor="#18B6FF"
                uncheckedIcon={false}
                checkedIcon={false}/>}
        {typeof this.state.showEmailSection !== 'boolean' && <p className="float-right">Loading...</p>}
      </div>

      {this.state.showEmailSection && !this.props.isSubscribed &&
      <NotificationForm disabled={working} subscribe={this.subscribe}/>}
    </Fragment>);
  }
}

NotificationSettings.propTypes = {
  t: PropTypes.func,
  isSubscribed: PropTypes.bool,
  email: PropTypes.string,
  error: PropTypes.string,
  working: PropTypes.bool,
  subscribeSuccess: PropTypes.bool,
  checkSubscription: PropTypes.func,
  hideError: PropTypes.func,
  hideSuccess: PropTypes.func,
  subscribe: PropTypes.func,
  unsubscribe: PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    isSubscribed: emailNotifications.selectors.isSubscribed(state),
    subscribeSuccess: emailNotifications.selectors.subscribeSuccess(state),
    email: emailNotifications.selectors.email(state),
    error: emailNotifications.selectors.error(state),
    working: emailNotifications.selectors.working(state)
  };
};

export default connect(
  mapStateToProps,
  {
    checkSubscription: emailNotifications.actions.checkEmailSubscription,
    subscribe: emailNotifications.actions.subscribeToEmail,
    unsubscribe: emailNotifications.actions.unsubscribeToEmail,
    hideError: emailNotifications.actions.hideError,
    hideSuccess: emailNotifications.actions.hideSuccess
  }
)(withNamespaces()(NotificationSettings));
