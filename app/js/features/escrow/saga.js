/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import { fork, takeEvery, call, put } from 'redux-saga/effects';
import {CREATE_ESCROW, CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED,
  GET_ESCROWS, GET_ESCROWS_FAILED, GET_ESCROWS_SUCCEEDED} from './constants';

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


export function *doGetEscows() {
  try {
    const events = yield Escrow.getPastEvents('Created', {fromBlock: 1, filter: {seller: web3.eth.defaultAccount}});
    const escrowIds = events.map(event => {
      return event.returnValues.escrowId;
    });

    const escrows = [];
    for (let i = 0; i < escrowIds.length; i++) {
      const escrow = yield call(Escrow.methods.transactions(parseInt(escrowIds[i], 10)).call);
      escrow.escrowId = escrowIds[i];
      escrows.push(escrow);
    }

    yield put({type: GET_ESCROWS_SUCCEEDED, escrows});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ESCROWS_FAILED, error: error.message});
  }
}

export function *onGetLicenseOwners() {
  yield takeEvery(GET_ESCROWS, doGetEscows);
}

export default [fork(onCreateEscrow), fork(onGetLicenseOwners)];
