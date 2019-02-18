import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './history';

import prices from './features/prices';
import license from './features/license';
import escrow from './features/escrow';
import network from './features/network';
import signature from './features/signature';
import arbitration from './features/arbitration';
import newSeller from './features/newSeller';
import buyer from './features/buyer';
import metadata from './features/metadata';

const rootReducer = combineReducers({
  router: connectRouter(history),
  prices: prices.reducer,
  license: license.reducer,
  network: network.reducer,
  escrow: escrow.reducer,
  signature: signature.reducer,
  arbitration: arbitration.reducer,
  newSeller: newSeller.reducer,
  buyer: buyer.reducer,
  metadata: metadata.reducer
});

export default rootReducer;
