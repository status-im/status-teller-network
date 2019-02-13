import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './history';

import prices from './features/prices';
import license from './features/license';
import escrow from './features/escrow';
import embarkjs from './features/embarkjs';
import signature from './features/signature';
import arbitration from './features/arbitration';
import newSeller from './features/newSeller';
import buyer from './features/buyer';
import metadata from './features/metadata';
import balances from './features/balances';

const rootReducer = combineReducers({
  router: connectRouter(history),
  prices: prices.reducer,
  license: license.reducer,
  embarkjs: embarkjs.reducer,
  escrow: escrow.reducer,
  signature: signature.reducer,
  arbitration: arbitration.reducer,
  newSeller: newSeller.reducer,
  buyer: buyer.reducer,
  metadata: metadata.reducer,
  balances: balances.reducer
});

export default rootReducer;
