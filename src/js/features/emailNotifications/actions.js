import {CHECK_EMAIL_SUBSCRIPTION, SUBSCRIBE_EMAIL, UNSUBSCRIBE_EMAIL,
  HIDE_ERROR, VERIFY_EMAIL, HIDE_SUCCESS, SET_REDIRECT_TARGET,
  REFUSE_EMAIL_NOTIFICATIONS, RESET_NOTIFICATION_WARNINGS, SET_HIDE_SIGNATURE_WARNING} from './constants';

export const checkEmailSubscription = () => {
  return {type: CHECK_EMAIL_SUBSCRIPTION};
};

export const setRedirectTarget = (redirectTarget) => {
  return {type: SET_REDIRECT_TARGET, redirectTarget};
};

export const subscribeToEmail = (email) => {
  return {type: SUBSCRIBE_EMAIL, email};
};

export const unsubscribeToEmail = () => {
  return {type: UNSUBSCRIBE_EMAIL};
};

export const hideError = () => {
  return {type: HIDE_ERROR};
};

export const hideSuccess = () => {
  return {type: HIDE_SUCCESS};
};

export const verifyEmail = (token) => {
  return {type: VERIFY_EMAIL, token};
};

export const refuseEmailNotifications = () => {
  return {type: REFUSE_EMAIL_NOTIFICATIONS};
};

export const setHideSignatureWarning = (value) => {
  return {type: SET_HIDE_SIGNATURE_WARNING, value};
};

export const resetNotificationWarnings = () => ({type: RESET_NOTIFICATION_WARNINGS});
