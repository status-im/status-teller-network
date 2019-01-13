import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './history';

import prices from './features/prices';
import license from './features/license';
import escrow from './features/escrow';
import embarkjs from './features/embarkjs';
import signature from './features/signature';

const rootReducer = combineReducers({
  router: connectRouter(history),
  prices: prices.reducer,
  license: license.reducer,
  embarkjs: embarkjs.reducer,
  escrow: escrow.reducer,
  signature: signature.reducer
});

export default rootReducer;
