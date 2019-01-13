/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import {fork, takeEvery, call, put} from 'redux-saga/effects';
import {
  GET_DISPUTED_ESCROWS, GET_DISPUTED_ESCROWS_FAILED, GET_DISPUTED_ESCROWS_SUCCEEDED,
  PAY_ESCROW, PAY_ESCROW_FAILED, PAY_ESCROW_SUCCEEDED
} from './constants';

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

export function *doGetEscrows() {
  try {
    const events = yield Escrow.getPastEvents('ArbitrationRequired', {fromBlock: 1});
    const escrowIds = events.map(event => {
      return event.returnValues.escrowId;
    });

    const escrows = [];
    for (let i = 0; i < escrowIds.length; i++) {
      const escrow = yield call(Escrow.methods.transactions(escrowIds[i]).call);
      escrow.escrowId = escrowIds[i];
      escrow.arbitration = yield call(Escrow.methods.arbitrationCases(escrowIds[i]).call);
      escrows.push(escrow);
    }

    yield put({type: GET_DISPUTED_ESCROWS_SUCCEEDED, escrows});
  } catch (error) {
    console.error(error);
    yield put({type: GET_DISPUTED_ESCROWS_FAILED, error: error.message});
  }
}

export function *onGetLicenseOwners() {
  yield takeEvery(GET_DISPUTED_ESCROWS, doGetEscrows);
}

export default [fork(onGetLicenseOwners), fork(onPayEscrow)];
