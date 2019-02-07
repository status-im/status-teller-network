import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './history';

import prices from './features/prices';
import license from './features/license';
import escrow from './features/escrow';
import embarkjs from './features/embarkjs';
import signature from './features/signature';
import arbitration from './features/arbitration';
import seller from './features/seller';
import buyer from './features/buyer';

const rootReducer = combineReducers({
  router: connectRouter(history),
  prices: prices.reducer,
  license: license.reducer,
  embarkjs: embarkjs.reducer,
  escrow: escrow.reducer,
  signature: signature.reducer,
  arbitration: arbitration.reducer,
  seller: seller.reducer,
  buyer: buyer.reducer
});

export default rootReducer;
