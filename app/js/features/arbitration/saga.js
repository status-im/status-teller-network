/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import {fork, takeEvery, call, put} from 'redux-saga/effects';
import {
  GET_DISPUTED_ESCROWS, GET_DISPUTED_ESCROWS_FAILED, GET_DISPUTED_ESCROWS_SUCCEEDED,
  RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED, RESOLVE_DISPUTE_SUCCEEDED,
  ARBITRATION_UNSOLVED
} from './constants';

export function *resolveDispute({escrowId, result}) {
  try {
    if(ARBITRATION_UNSOLVED === result) throw new Error("Arbitration must have a result");
    const toSend = Escrow.methods.setArbitrationResult(escrowId, result);
    const estimatedGas = yield call(toSend.estimateGas);
    yield call(toSend.send, {gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    yield put({type: RESOLVE_DISPUTE_SUCCEEDED, escrowId});
  } catch (error) {
    console.error(error);
    yield put({type: RESOLVE_DISPUTE_FAILED, error: error.message});
  }
}

export function *onResolveDispute() {
  yield takeEvery(RESOLVE_DISPUTE, resolveDispute);
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

export function *onGetEscrows() {
  yield takeEvery(GET_DISPUTED_ESCROWS, doGetEscrows);
}

export default [fork(onGetEscrows), fork(onResolveDispute)];
