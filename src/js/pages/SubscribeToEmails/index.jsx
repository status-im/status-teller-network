import React, {Component, Fragment} from "react";
import {withNamespaces} from "react-i18next";
import PropTypes from "prop-types";
import {Alert, Button} from 'reactstrap';
import {connect} from "react-redux";
import emailNotifications from '../../features/emailNotifications';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import NotificationForm from "../../components/NotificationForm";
import RoundedIcon from "../../ui/RoundedIcon";
import bellIcon from "../../../images/bell.svg";
import {withRouter} from "react-router-dom";

class SubscribeToEmails extends Component {
  hideError = () => {
    this.props.hideError();
  };

  hideSuccess = () => {
    this.props.hideSuccess();
  };

  subscribe = (email) => {
    this.props.subscribe(email);
  };

  moveOn = () => {
    this.props.history.push(this.props.redirectTarget || '/buy');
  };

  render() {
    const {t, working, error, subscribeSuccess, isSubscribed} = this.props;

    return <div className="px-5">
      <div className="text-center">
        <RoundedIcon image={bellIcon} className="mb-3" bgColor="blue"/>
        <h3 className="mb-1">Email notifications</h3>
        <p className="text-muted mb-0">
          {t('emailNotifications.notifOnTrades')}
        </p>
        <p className="text-muted">
          {t('emailNotifications.youCanChange')}
        </p>
      </div>

      {error && <Alert color="danger" toggle={this.hideError}>Error: {error}</Alert>}
      {subscribeSuccess && <Alert color="success" toggle={this.hideSuccess}>{t('emailNotifications.success')}</Alert>}
      {working && <Fragment>Loading... <FontAwesomeIcon icon={faCircleNotch} spin/></Fragment>}

      {!subscribeSuccess && !isSubscribed && <NotificationForm disabled={working} subscribe={this.subscribe}/>}
      <div className="text-center">
        {!subscribeSuccess && !isSubscribed && <Button color="secondary" className="mt-2" onClick={this.moveOn}>Skip</Button>}
        {(subscribeSuccess || isSubscribed) && <Button color="primary" onClick={this.moveOn}>Ok</Button>}
      </div>
    </div>;
  }
}

SubscribeToEmails.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  error: PropTypes.string,
  redirectTarget: PropTypes.string,
  working: PropTypes.bool,
  subscribeSuccess: PropTypes.bool,
  isSubscribed: PropTypes.bool,
  hideError: PropTypes.func,
  hideSuccess: PropTypes.func,
  subscribe: PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    subscribeSuccess: emailNotifications.selectors.subscribeSuccess(state),
    isSubscribed: emailNotifications.selectors.isSubscribed(state),
    email: emailNotifications.selectors.email(state),
    error: emailNotifications.selectors.error(state),
    redirectTarget: emailNotifications.selectors.redirectTarget(state),
    working: emailNotifications.selectors.working(state)
  };
};

export default connect(
  mapStateToProps,
  {
    subscribe: emailNotifications.actions.subscribeToEmail,
    hideError: emailNotifications.actions.hideError,
    hideSuccess: emailNotifications.actions.hideSuccess
  }
)(withRouter(withNamespaces()(SubscribeToEmails)));
