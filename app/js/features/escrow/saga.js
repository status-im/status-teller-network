/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import { fork, takeEvery, call, put } from 'redux-saga/effects';
import {CREATE_ESCROW, CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED} from './constants';

const zeroAddress = '0x0000000000000000000000000000000000000000';

export async function *createEscrow({expiration, value, buyer}) {
  try {
    // TODO do we want to change the token or always ETH?
    const toSend = Escrow.methods.create(buyer, value, zeroAddress, expiration);
    const estimatedGas = yield call(toSend.estimateGas);
    const receipt = yield call(toSend.send, {gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount, value});
    console.log(receipt);
    yield put({type: CREATE_ESCROW_SUCCEEDED});
  } catch (error) {
    console.error(error);
    yield put({type: CREATE_ESCROW_FAILED, error});
  }
}

export function *onCreateEscrow() {
  yield takeEvery(CREATE_ESCROW, createEscrow);
}

export default [fork(onCreateEscrow)];
