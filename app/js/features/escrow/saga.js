/*global web3*/
import Escrow from 'Embark/contracts/Escrow';

import { eventChannel, END } from 'redux-saga';
import {fork, takeEvery, call, put, take} from 'redux-saga/effects';
import {
  CREATE_ESCROW, CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW_PRE_SUCCESS,
  GET_ESCROWS, GET_ESCROWS_FAILED, GET_ESCROWS_SUCCEEDED,
  RELEASE_ESCROW, RELEASE_ESCROW_FAILED, RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW_PRE_SUCCESS,
  CANCEL_ESCROW, CANCEL_ESCROW_FAILED, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW_PRE_SUCCESS,
  RATE_TRANSACTION, RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_PRE_SUCCESS,
  PAY_ESCROW, PAY_ESCROW_FAILED, PAY_ESCROW_SUCCEEDED, PAY_ESCROW_PRE_SUCCESS,
  OPEN_CASE, OPEN_CASE_FAILED, OPEN_CASE_SUCCEEDED, PAY_ESCROW_SIGNATURE, OPEN_CASE_PRE_SUCCESS,
  PAY_ESCROW_SIGNATURE_SUCCEEDED, PAY_ESCROW_SIGNATURE_FAILED,
  OPEN_CASE_SIGNATURE, OPEN_CASE_SIGNATURE_SUCCEEDED, OPEN_CASE_SIGNATURE_FAILED,
  SIGNATURE_PAYMENT, SIGNATURE_OPEN_CASE 
} from './constants';

const zeroAddress = '0x0000000000000000000000000000000000000000';

// TODO CATCH ERROR
function promiseEventEmitter(promiseEvent, emitter) {
  promiseEvent.on('transactionHash', function(hash) {
    emitter({hash});
  });
  promiseEvent.on('receipt', function(receipt) {
    emitter({receipt});
    emitter(END);
  });
  promiseEvent.on('error', function(error) {
    emitter({error});
    emitter(END);
  });
  return () => {};
}

export function *createEscrow({expiration, value, buyer}) {
  try {
    // TODO do we want to change the token or always ETH?
    const toSend = Escrow.methods.create(buyer, parseInt(value, 10), zeroAddress, expiration);
    const estimatedGas = yield call(toSend.estimateGas, {value});

    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount, value});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: CREATE_ESCROW_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        yield put({type: CREATE_ESCROW_SUCCEEDED, receipt: receipt});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
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
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: RELEASE_ESCROW_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        yield put({type: RELEASE_ESCROW_SUCCEEDED, escrowId});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
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
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: PAY_ESCROW_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        yield put({type: PAY_ESCROW_SUCCEEDED, escrowId});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
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

export function *openCase({escrowId}) {
  try {
    const toSend = Escrow.methods.openCase(escrowId);
    const estimatedGas = yield call(toSend.estimateGas);
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: OPEN_CASE_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        const escrows = yield formatEscrows([escrowId]);
        const arbitration = escrows[0].arbitration;
        yield put({type: OPEN_CASE_SUCCEEDED, escrowId, arbitration});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
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
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: CANCEL_ESCROW_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        yield put({type: CANCEL_ESCROW_SUCCEEDED, escrowId});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
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
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: RATE_TRANSACTION_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        yield put({type: RATE_TRANSACTION_SUCCEEDED, escrowId, rating});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(error);
    yield put({type: RATE_TRANSACTION_FAILED, error: error.message});
  }
}

export function *onRateTx() {
  yield takeEvery(RATE_TRANSACTION, rateTx);
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

export function *doGetEscrows() {
  try {
    const eventsSeller = yield Escrow.getPastEvents('Created', {fromBlock: 1, filter: {seller: web3.eth.defaultAccount}});
    const eventsBuyer = yield Escrow.getPastEvents('Created', {fromBlock: 1, filter: {buyer: web3.eth.defaultAccount}});
    const events = eventsSeller.concat(eventsBuyer);
    const escrowIds = events.map(event => {
      return event.returnValues.escrowId;
    });
    const escrows = yield formatEscrows(escrowIds);

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
