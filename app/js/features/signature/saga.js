import {fork, takeEvery} from 'redux-saga/effects';
import {INCLUDE_SIGNATURE, INCLUDE_SIGNATURE_FAILED, INCLUDE_SIGNATURE_SUCCEEDED, INCLUDE_SIGNATURE_PRE_SUCCESS} from './constants';
import {doTransaction} from "../../utils/saga";

export function *onIncludeSignature() {
  yield takeEvery(INCLUDE_SIGNATURE, doTransaction.bind(null, INCLUDE_SIGNATURE_PRE_SUCCESS, INCLUDE_SIGNATURE_SUCCEEDED, INCLUDE_SIGNATURE_FAILED));
}

export default [fork(onIncludeSignature)];
