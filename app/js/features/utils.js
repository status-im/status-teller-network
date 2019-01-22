import {END} from "redux-saga";

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
