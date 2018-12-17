import { applyMiddleware, compose, createStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

import history from './history';
import rootReducer from './reducer';

function *root() {
  yield all([
    
  ]);
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  connectRouter(history)(rootReducer),
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      sagaMiddleware
    ),
  ),
);

sagaMiddleware.run(root);

export default store;