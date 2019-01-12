/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import {fork, takeEvery, call, put} from 'redux-saga/effects';
import {
  CREATE_ESCROW, CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED,
  GET_ESCROWS, GET_ESCROWS_FAILED, GET_ESCROWS_SUCCEEDED,
  RELEASE_ESCROW, RELEASE_ESCROW_FAILED, RELEASE_ESCROW_SUCCEEDED,
  CANCEL_ESCROW, CANCEL_ESCROW_FAILED, CANCEL_ESCROW_SUCCEEDED,
  RATE_TRANSACTION, RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED,
  PAY_ESCROW, PAY_ESCROW_FAILED, PAY_ESCROW_SUCCEEDED,
  OPEN_CASE, OPEN_CASE_FAILED, OPEN_CASE_SUCCEEDED, PAY_ESCROW_SIGNATURE,
  PAY_ESCROW_SIGNATURE_SUCCEEDED, PAY_ESCROW_SIGNATURE_FAILED,
  OPEN_CASE_SIGNATURE, OPEN_CASE_SIGNATURE_SUCCEEDED, OPEN_CASE_SIGNATURE_FAILED,
  DIALOG_PAY_SIGNATURE, DIALOG_OPEN_CASE_SIGNATURE
} from './constants';

const zeroAddress = '0x0000000000000000000000000000000000000000';

export function *createEscrow({expiration, value, buyer}) {
  try {
    // TODO do we want to change the token or always ETH?
    expiration /= 1000; // Solidity is in seconds, while this is milliseconds
    const toSend = Escrow.methods.create(buyer, parseInt(value, 10), zeroAddress, expiration);
    const estimatedGas = yield call(toSend.estimateGas, {value});
    const receipt = yield call(toSend.send, {gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount, value});
    yield put({type: CREATE_ESCROW_SUCCEEDED, receipt: receipt});
  } catch (error) {
    console.error(error);
    yield put({type: CREATE_ESCROW_FAILED, error: error.message});
  }
}

export function *onCreateEscrow() {
  yield takeEvery(CREATE_ESCROW, createEscrow);
}

export function *releaseEscrow({escrowId}) {
  try {
    const toSend = Escrow.methods.release(escrowId);
    const estimatedGas = yield call(toSend.estimateGas);
    yield call(toSend.send, {gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    yield put({type: RELEASE_ESCROW_SUCCEEDED, escrowId});
  } catch (error) {
    console.error(error);
    yield put({type: RELEASE_ESCROW_FAILED, error: error.message});
  }
}

export function *onReleaseEscrow() {
  yield takeEvery(RELEASE_ESCROW, releaseEscrow);
}

export function *payEscrow({escrowId}) {
  try {
    const toSend = Escrow.methods.pay(escrowId);
    const estimatedGas = yield call(toSend.estimateGas);
    yield call(toSend.send, {gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    yield put({type: PAY_ESCROW_SUCCEEDED, escrowId});
  } catch (error) {
    console.error(error);
    yield put({type: PAY_ESCROW_FAILED, error: error.message});
  }
}

export function *onPayEscrow() {
  yield takeEvery(PAY_ESCROW, payEscrow);
}

export function *payEscrowSignature({escrowId}) {
  try {
    const messageHash = yield call(Escrow.methods.paySignHash(escrowId).call, {from: web3.eth.defaultAccount});
    const signedMessage = yield call(web3.eth.personal.sign, messageHash, web3.eth.defaultAccount);
    yield put({type: PAY_ESCROW_SIGNATURE_SUCCEEDED, escrowId, signedMessage, dialogType: DIALOG_PAY_SIGNATURE});
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
    yield put({type: OPEN_CASE_SIGNATURE_SUCCEEDED, escrowId, signedMessage, dialogType: DIALOG_OPEN_CASE_SIGNATURE});
  } catch (error) {
    console.error(error);
    yield put({type: OPEN_CASE_SIGNATURE_FAILED, error: error.message});
  }
}

export function *onOpenCaseSignature() {
  yield takeEvery(OPEN_CASE_SIGNATURE, openCaseSignature);
}

export function *openCase({escrowId}) {
  try {
    const toSend = Escrow.methods.openCase(escrowId);
    const estimatedGas = yield call(toSend.estimateGas);
    yield call(toSend.send, {gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    yield put({type: OPEN_CASE_SUCCEEDED, escrowId});
  } catch (error) {
    console.error(error);
    yield put({type: OPEN_CASE_FAILED, error: error.message});
  }
}

export function *onOpenCase() {
  yield takeEvery(OPEN_CASE, openCase);
}

export function *cancelEscrow({escrowId}) {
  try {
    const toSend = Escrow.methods.cancel(escrowId);
    const estimatedGas = yield call(toSend.estimateGas);
    yield call(toSend.send, {gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    yield put({type: CANCEL_ESCROW_SUCCEEDED, escrowId});
  } catch (error) {
    console.error(error);
    yield put({type: CANCEL_ESCROW_FAILED, error: error.message});
  }
}

export function *onCancelEscrow() {
  yield takeEvery(CANCEL_ESCROW, cancelEscrow);
}

export function *rateTx({escrowId, rating}) {
  try {
    const toSend = Escrow.methods.rateTransaction(escrowId, rating);
    const estimatedGas = yield call(toSend.estimateGas);
    yield call(toSend.send, {gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    yield put({type: RATE_TRANSACTION_SUCCEEDED, escrowId, rating});
  } catch (error) {
    console.error(error);
    yield put({type: RATE_TRANSACTION_FAILED, error: error.message});
  }
}

export function *onRateTx() {
  yield takeEvery(RATE_TRANSACTION, rateTx);
}

export function *doGetEscrows() {
  try {
    const eventsSeller = yield Escrow.getPastEvents('Created', {fromBlock: 1, filter: {seller: web3.eth.defaultAccount}});
    const eventsBuyer = yield Escrow.getPastEvents('Created', {fromBlock: 1, filter: {buyer: web3.eth.defaultAccount}});
    const events = eventsSeller.concat(eventsBuyer);
    const escrowIds = events.map(event => {
      return event.returnValues.escrowId;
    });

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

    yield put({type: GET_ESCROWS_SUCCEEDED, escrows});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ESCROWS_FAILED, error: error.message});
  }
}

export function *onGetLicenseOwners() {
  yield takeEvery(GET_ESCROWS, doGetEscrows);
}

export default [fork(onCreateEscrow), fork(onGetLicenseOwners), fork(onReleaseEscrow), fork(onCancelEscrow), fork(onRateTx), fork(onPayEscrow), fork(onPayEscrowSignature), fork(onOpenCase), fork(onOpenCaseSignature)];
