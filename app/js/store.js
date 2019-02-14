import { applyMiddleware, compose, createStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import history from './history';
import rootReducer from './reducer';

import prices from './features/prices';
import license from './features/license';
import embarkjs from './features/embarkjs';
import escrow from './features/escrow';
import signature from './features/signature';
import arbitration from './features/arbitration';
import metadata from './features/metadata';
import balances from './features/balances';

const persistConfig = {
  key: 'teller-network-store',
  storage,
  blacklist: ['embarkjs']
};

function *root() {
  yield all([
    ...prices.saga,
    ...license.saga,
    ...embarkjs.saga,
    ...escrow.saga,
    ...signature.saga,
    ...arbitration.saga,
    ...metadata.saga,
    ...balances.saga
  ]);
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  connectRouter(history)(persistReducer(persistConfig, rootReducer)),
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      sagaMiddleware
    ),
  ),
);

sagaMiddleware.run(root);
const persistor = persistStore(store);

export { store, persistor };
