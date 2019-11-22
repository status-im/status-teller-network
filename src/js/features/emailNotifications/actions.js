import {CHECK_EMAIL_SUBSCRIPTION, SUBSCRIBE_EMAIL, UNSUBSCRIBE_EMAIL, HIDE_ERROR, VERIFY_EMAIL, HIDE_SUCCESS} from './constants';

export const checkEmailSubscription = () => {
  return {type: CHECK_EMAIL_SUBSCRIPTION};
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