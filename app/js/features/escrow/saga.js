/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import { fork, takeEvery, call, put } from 'redux-saga/effects';
import {CREATE_ESCROW, CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED} from './constants';

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

export default [fork(onCreateEscrow)];
