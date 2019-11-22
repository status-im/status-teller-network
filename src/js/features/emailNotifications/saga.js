/* global web3 */

import {call, fork, put, takeEvery} from 'redux-saga/effects';
import {
  DAPP_ID, EMAIL_SERVER_ENDPOINT, EMAIL_SERVER_ENDPOINT_WITHOUT_DAPP_ID, OK,
  CHECK_EMAIL_SUBSCRIPTION, CHECK_EMAIL_SUBSCRIPTION_SUCCESS, CHECK_EMAIL_SUBSCRIPTION_FAILURE,
  SUBSCRIBE_EMAIL, SUBSCRIBE_EMAIL_FAILURE, SUBSCRIBE_EMAIL_SUCCESS,
  VERIFY_EMAIL, VERIFY_EMAIL_FAILURE, VERIFY_EMAIL_SUCCESS,
  UNSUBSCRIBE_EMAIL, UNSUBSCRIBE_EMAIL_FAILURE, UNSUBSCRIBE_EMAIL_SUCCESS
} from './constants';
import axios from 'axios';

export function *checkSubscription() {
  try {
    const account = web3.eth.defaultAccount;

    const response = yield call(axios.get, `${EMAIL_SERVER_ENDPOINT}/user/${account}`);
    yield put({type: CHECK_EMAIL_SUBSCRIPTION_SUCCESS, subscribed: response.data.isUser});
  } catch (error) {
    yield put({type: CHECK_EMAIL_SUBSCRIPTION_FAILURE, error: error.message});
  }
}

export function *onCheckSubscription() {
  yield takeEvery(CHECK_EMAIL_SUBSCRIPTION, checkSubscription);
}

export function *subscribeToEmails({email}) {
  try {
    const address = web3.eth.defaultAccount;
    const signature = yield call(web3.eth.sign, email, address);
    const response = yield call(axios.post, `${EMAIL_SERVER_ENDPOINT}/subscribe`, {email, signature, address});
    if (!response.data === OK) {
      throw new Error('Subscription did not return Ok');
    }
    yield put({type: SUBSCRIBE_EMAIL_SUCCESS, email});
  } catch (error) {
    yield put({type: SUBSCRIBE_EMAIL_FAILURE, error: error.message});
  }
}

export function *onSubscribeToEmails() {
  yield takeEvery(SUBSCRIBE_EMAIL, subscribeToEmails);
}

export function *unsubscribeToEmails() {
  try {
    const address = web3.eth.defaultAccount;
    const signature = yield call(web3.eth.sign, DAPP_ID, address);
    const response = yield call(axios.post, `${EMAIL_SERVER_ENDPOINT}/unsubscribe`, {signature, address});
    if (!response.data === OK) {
      throw new Error('Un-Subscription did not return Ok');
    }
    yield put({type: UNSUBSCRIBE_EMAIL_SUCCESS});
  } catch (error) {
    yield put({type: UNSUBSCRIBE_EMAIL_FAILURE, error: error.message});
  }
}

export function *onUnsubscribeToEmails() {
  yield takeEvery(UNSUBSCRIBE_EMAIL, unsubscribeToEmails);
}

export function *verifyEmail({token}) {
  try {
    const response = yield call(axios.get, `${EMAIL_SERVER_ENDPOINT_WITHOUT_DAPP_ID}/confirm/${token}`);
    if (!response.data === OK) {
      throw new Error('Subscription did not return Ok');
    }
    yield put({type: VERIFY_EMAIL_SUCCESS});
  } catch (error) {
    yield put({type: VERIFY_EMAIL_FAILURE, error: error.message});
  }
}

export function *onVerifyEmail() {
  yield takeEvery(VERIFY_EMAIL, verifyEmail);
}

export default [
  fork(onCheckSubscription),
  fork(onSubscribeToEmails),
  fork(onVerifyEmail),
  fork(onUnsubscribeToEmails)
];
