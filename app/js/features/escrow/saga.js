/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import {all, fork, takeEvery, call, put} from 'redux-saga/effects';
import {doTransaction} from '../../utils/saga';
import {
  CREATE_ESCROW, CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW_PRE_SUCCESS,
  LOAD_ESCROWS, LOAD_ESCROWS_FAILED, LOAD_ESCROWS_SUCCEEDED,
  RELEASE_ESCROW, RELEASE_ESCROW_FAILED, RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW_PRE_SUCCESS,
  CANCEL_ESCROW, CANCEL_ESCROW_FAILED, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW_PRE_SUCCESS,
  RATE_TRANSACTION, RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_PRE_SUCCESS,
  PAY_ESCROW, PAY_ESCROW_FAILED, PAY_ESCROW_SUCCEEDED, PAY_ESCROW_PRE_SUCCESS,
  OPEN_CASE, OPEN_CASE_FAILED, OPEN_CASE_SUCCEEDED, PAY_ESCROW_SIGNATURE, OPEN_CASE_PRE_SUCCESS,
  PAY_ESCROW_SIGNATURE_SUCCEEDED, PAY_ESCROW_SIGNATURE_FAILED,
  OPEN_CASE_SIGNATURE, OPEN_CASE_SIGNATURE_SUCCEEDED, OPEN_CASE_SIGNATURE_FAILED,
  SIGNATURE_PAYMENT, SIGNATURE_OPEN_CASE, GET_ARBITRATION_BY_ID_FAILED
} from './constants';

export function *onCreateEscrow() {
  yield takeEvery(CREATE_ESCROW, doTransaction.bind(null, CREATE_ESCROW_PRE_SUCCESS, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW_FAILED));
}

export function *onReleaseEscrow() {
  yield takeEvery(RELEASE_ESCROW, doTransaction.bind(null, RELEASE_ESCROW_PRE_SUCCESS, RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW_FAILED));
}

export function *onPayEscrow() {
  yield takeEvery(PAY_ESCROW, doTransaction.bind(null, PAY_ESCROW_PRE_SUCCESS, PAY_ESCROW_SUCCEEDED, PAY_ESCROW_FAILED));
}

export function *payEscrowSignature({escrowId}) {
  try {
    const messageHash = yield call(Escrow.methods.paySignHash(escrowId).call, {from: web3.eth.defaultAccount});
    const signedMessage = yield call(web3.eth.personal.sign, messageHash, web3.eth.defaultAccount);
    yield put({type: PAY_ESCROW_SIGNATURE_SUCCEEDED, escrowId, signedMessage, signatureType: SIGNATURE_PAYMENT});
  } catch (error) {
    console.error(error);
    yield put({type: PAY_ESCROW_SIGNATURE_FAILED, error: error.message});
  }
}

export function *onPayEscrowSignature() {
  yield takeEvery(PAY_ESCROW_SIGNATURE, payEscrowSignature);
}

export function *openCaseSignature({escrowId}) {
  try {
    const messageHash = yield call(Escrow.methods.openCaseSignHash(escrowId).call, {from: web3.eth.defaultAccount});
    const signedMessage = yield call(web3.eth.personal.sign, messageHash, web3.eth.defaultAccount);
    yield put({type: OPEN_CASE_SIGNATURE_SUCCEEDED, escrowId, signedMessage, signatureType: SIGNATURE_OPEN_CASE});
  } catch (error) {
    console.error(error);
    yield put({type: OPEN_CASE_SIGNATURE_FAILED, error: error.message});
  }
}

export function *onOpenCaseSignature() {
  yield takeEvery(OPEN_CASE_SIGNATURE, openCaseSignature);
}

export function *onOpenCase() {
  yield takeEvery(OPEN_CASE, doTransaction.bind(null, OPEN_CASE_PRE_SUCCESS, OPEN_CASE_SUCCEEDED, OPEN_CASE_FAILED));
}

export function *getArbitrationById({escrowId}) {
  try {
    yield formatEscrows([escrowId]);
    // FIXME adding this breaks sends a second transaction for some reason. SEND HELP
    // const arbitration = escrows[0].arbitration;
    // yield put({type: GET_ARBITRATION_BY_ID_SUCCEEDED, escrowId, arbitration});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ARBITRATION_BY_ID_FAILED, error: error.message});
  }
}

export function *onOpenCaseSuccess() {
  yield takeEvery(OPEN_CASE_SUCCEEDED, getArbitrationById);
}

export function *onCancelEscrow() {
  yield takeEvery(CANCEL_ESCROW, doTransaction.bind(null, CANCEL_ESCROW_PRE_SUCCESS, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW_FAILED));
}

export function *onRateTx() {
  yield takeEvery(RATE_TRANSACTION,  doTransaction.bind(null, RATE_TRANSACTION_PRE_SUCCESS, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_FAILED));
}

function *formatEscrows(escrowIds) {
  const escrows = [];
  for (let i = 0; i < escrowIds.length; i++) {
    const escrow = yield call(Escrow.methods.transactions(escrowIds[i]).call);
    escrow.escrowId = escrowIds[i];
    if(escrow.paid){
      const arbitration = yield call(Escrow.methods.arbitrationCases(escrowIds[i]).call);
      if(arbitration.open){
        escrow.arbitration = arbitration;
      }
    }
    escrows.push(escrow);
  }
  return escrows;
}

export function *doLoadEscrows({offerId}) {
  try {
    const escrowIds = yield Escrow.methods.getTransactionsIdByOfferId(offerId).call();
    const escrows = yield all(escrowIds.map(function *(id) {
      return yield Escrow.methods.transactions(id).call();
    }));
    
    yield put({type: LOAD_ESCROWS_SUCCEEDED, escrows, offerId});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_ESCROWS_FAILED, error: error.message});
  }
}

export function *onLoadEscrows() {
  yield takeEvery(LOAD_ESCROWS, doLoadEscrows);
}

export default [
  fork(onCreateEscrow), fork(onLoadEscrows), fork(onReleaseEscrow), fork(onCancelEscrow),
  fork(onRateTx), fork(onPayEscrow), fork(onPayEscrowSignature), fork(onOpenCase), fork(onOpenCaseSignature), fork(onOpenCaseSuccess)
];
