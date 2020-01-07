import React, {Component, Fragment} from "react";
import {withTranslation} from "react-i18next";
import PropTypes from "prop-types";
import {Alert} from 'reactstrap';
import Switch from "react-switch";
import {connect} from "react-redux";
import emailNotifications from '../../features/emailNotifications';
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
    if ((prevProps.isSubscribed !== this.props.isSubscribed) || (!prevProps.error && this.props.error)) {
      this.setState({showEmailSection: this.props.isSubscribed});
    }
  }

  changeNotificationParam = (checked) => {
    if (checked === false && this.props.isSubscribed) {
      this.props.unsubscribe();
    }

    if(!checked){
      this.setState({showEmailSection: !this.props.isSubscribed ? false : ''});
    } else {
      this.setState({showEmailSection: true});
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
      {error && <Alert color="danger" toggle={this.hideError}>{t('general.error')}: {error}</Alert>}
      {subscribeSuccess && <Alert color="success" toggle={this.hideSuccess}>{t('notificationSettings.success')}</Alert>}
      <div>
        {t('notificationSettings.emailSwitcher')}
        {typeof this.state.showEmailSection === 'boolean' && <Switch onChange={this.changeNotificationParam}
                checked={this.state.showEmailSection}
                className="float-right"
                onColor="#18B6FF"
                uncheckedIcon={false}
                checkedIcon={false}/>}
        {typeof this.state.showEmailSection !== 'boolean' && (
          <div className="float-right spinner-border mr-3 mt-1 spinner-border-sm" role="status">
            <span className="sr-only">{t('general.loading')}</span>
          </div>
        )}
      </div>

      {this.state.showEmailSection && !this.props.isSubscribed &&
      <NotificationForm working={working} subscribe={this.subscribe}/>}
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
)(withTranslation()(NotificationSettings));
