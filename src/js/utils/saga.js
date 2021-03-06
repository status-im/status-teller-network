/*global web3*/
import {END, eventChannel} from "redux-saga";
import {call, put, take, select} from "redux-saga/effects";
import cloneDeep from "clone-deep";
import {acceptedTransactionWarning} from '../features/network/selectors';
import {SHOW_TRANSACTION_WARNING} from "../features/network/constants";
import {neverShowTransactionWarningAgain} from "../features/metadata/selectors";
import {shouldUseRelay} from "../provider";

export const TX = 'tx';
export const GSN = 'GSN';
export const SIGN = 'SIGN';

export function promiseEventEmitter(promiseEvent, emitter) {
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

function *waitForUserAccept(toSend) {
  const neverShow = yield select(neverShowTransactionWarningAgain);
  if (neverShow) {
    return;
  }

  let warningType = TX;
  try {
    if (toSend) {
      const isGSN = yield shouldUseRelay(toSend.encodeABI(), toSend._parent.options.address, 'eth_sendTransaction');
      warningType = isGSN ? GSN : warningType;
    } else {
      warningType = SIGN;
    }
  } catch (e) {
    // Something failed in the check, let's just show the normal modal
    console.error(e);
  }

  yield put({type: SHOW_TRANSACTION_WARNING, warningType});
  let stateSlice = yield select(acceptedTransactionWarning);
  while (stateSlice !== true) {
    yield take();
    stateSlice = yield select(acceptedTransactionWarning);
    if (stateSlice === false) {
      throw new Error('Warning refused');
    }
  }
}

export function *doTransaction(preSuccess, success, failed, {value = 0, toSend}) {
  const parsedPayload = cloneDeep(arguments[3]);
  delete parsedPayload.toSend;
  delete parsedPayload.type;
  try {
    // Wait for the user to accept the warning
    yield waitForUserAccept(toSend);

    const estimatedGas = yield call(toSend.estimateGas, {value, from: web3.eth.defaultAccount});
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount, value});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: preSuccess, txHash: hash, ...parsedPayload});
      } else if (receipt) {
        const parsedPayload = cloneDeep(arguments[3]);
        delete parsedPayload.toSend;
        delete parsedPayload.type;
        yield put({type: success, receipt: receipt, ...parsedPayload});
        break;
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(error);
    yield put({type: failed, error: error.message, ...parsedPayload});
  }
}

export function *doSign(message, account) {
  yield waitForUserAccept();
  const signature = yield call(web3.eth.personal.sign, message, account || web3.eth.defaultAccount);
  return signature;
}

export function contractOnceEventChannel(contract, event, filter, emitter) {
  contract.once(event, {filter}, (err, result) => {
    if (err) {
      emitter({err});
      return emitter(END);
    }
    emitter({result});
    emitter(END);
  });
  return () => {};
}

export function contractEventChannel(contract, event, filter, emitter) {
  const sub = contract.events[event]({
    filter
  }, (err, result) => {
    if (err) {
      emitter({err});
      return emitter(END);
    }
    emitter({result});
  });
  return () => {
    sub.unsubscribe();
  };
}

export function *contractEvent(contract, event, filter, successType, perpetualEvent) {
  let channel;
  if (perpetualEvent) {
    channel = eventChannel(contractEventChannel.bind(null, contract, event, filter));
  } else {
    channel = eventChannel(contractOnceEventChannel.bind(null, contract, event, filter));
  }
  while (true) {
    const {result, error} = yield take(channel);
    if (result) {
      yield put({...filter, type: successType, result});
    } else if (error) {
      throw error;
    } else {
      break;
    }
  }
}
