import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './history';

import example from './features/example'
import prices from './features/prices'

const rootReducer = combineReducers({
  router: connectRouter(history),
  example: example.reducer,
  prices: prices.reducer
});

export default rootReducer;
