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
  try {
    const estimatedGas = yield call(toSend.estimateGas, {value});
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000, from: web3.eth.defaultAccount, value});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: preSuccess, txHash: hash});
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
    yield put({type: failed, error: error.message});
  }
}
