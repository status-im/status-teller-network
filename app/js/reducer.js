import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './history';

import prices from './features/prices';
import license from './features/license';
import embarkjs from './features/embarkjs';

const rootReducer = combineReducers({
  router: connectRouter(history),
  prices: prices.reducer,
  license: license.reducer,
  embarkjs: embarkjs.reducer
});

export default rootReducer;
