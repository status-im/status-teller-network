/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import {fork, takeEvery, call, put, take} from 'redux-saga/effects';
import {INCLUDE_SIGNATURE, INCLUDE_SIGNATURE_FAILED, INCLUDE_SIGNATURE_SUCCEEDED, SIGNATURE_PAYMENT,
  SIGNATURE_OPEN_CASE, INCLUDE_SIGNATURE_PRE_SUCCESS} from './constants';
import {eventChannel} from "redux-saga";
import {promiseEventEmitter} from "../utils";

export function *includeSignature({signature: {escrowId, message, type}}) {
  try {
    let method;
    
    switch(type){
      case SIGNATURE_PAYMENT:
        method = 'pay(uint256,bytes)';
      break;
      case SIGNATURE_OPEN_CASE:
        method = 'openCase(uint256,bytes)';
      break;
      default:
        throw new Error("Invalid signature type");
    }
    
    const toSend = Escrow.methods[method](escrowId, message);
    const estimatedGas = yield call(toSend.estimateGas);
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: INCLUDE_SIGNATURE_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        yield put({type: INCLUDE_SIGNATURE_SUCCEEDED, receipt});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(error);
    yield put({type: INCLUDE_SIGNATURE_FAILED, error: error.message});
  }
}

export function *onIncludeSignature() {
  yield takeEvery(INCLUDE_SIGNATURE, includeSignature);
}

export default [fork(onIncludeSignature)];
