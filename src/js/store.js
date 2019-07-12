import LogRocket from 'logrocket';
import { applyMiddleware, compose, createStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import history from './history';
import rootReducer from './reducer';

import prices from './features/prices';
import license from './features/license';
import network from './features/network';
import escrow from './features/escrow';
import signature from './features/signature';
import arbitration from './features/arbitration';
import metadata from './features/metadata';
import approval from './features/approval';

const persistConfig = {
  key: 'teller-network-store',
  storage,
  stateReconciler: autoMergeLevel2,
  blacklist: ['network', 'approval', 'router', 'events']
};

function *root() {
  yield all([
    ...prices.saga,
    ...license.saga,
    ...network.saga,
    ...escrow.saga,
    ...signature.saga,
    ...arbitration.saga,
    ...metadata.saga,
    ...approval.saga
  ]);
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  connectRouter(history)(persistReducer(persistConfig, rootReducer)),
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      sagaMiddleware,
      LogRocket.reduxMiddleware()
    ),
  ),
);

sagaMiddleware.run(root);
const persistor = persistStore(store);

export { store, persistor };
