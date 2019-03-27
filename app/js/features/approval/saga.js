import {fork, takeEvery} from 'redux-saga/effects';
import {doTransaction} from '../../utils/saga';

import { APPROVE_TOKEN, APPROVE_PRE_SUCCEEDED, APPROVE_SUCCEEDED, APPROVE_FAILED } from './constants';

export function *onApproveToken() {
  yield takeEvery(APPROVE_TOKEN, doTransaction.bind(null, APPROVE_PRE_SUCCEEDED, APPROVE_SUCCEEDED, APPROVE_FAILED));
}

export default [fork(onApproveToken)];
