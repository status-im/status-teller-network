/*global web3*/
import {END, eventChannel} from "redux-saga";
import {call, put, take} from "redux-saga/effects";
import cloneDeep from "clone-deep";

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

export function *doTransaction(preSuccess, success, failed, {value = 0, toSend}) {
  const parsedPayload = cloneDeep(arguments[3]);
  delete parsedPayload.toSend;
  delete parsedPayload.type;

  try {
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
