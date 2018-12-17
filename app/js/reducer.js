import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './history';

import example from './features/example'

const rootReducer = combineReducers({
  router: connectRouter(history),
  example: example.reducer
});

export default rootReducer;