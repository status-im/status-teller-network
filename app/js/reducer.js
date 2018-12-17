import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './history';

const rootReducer = combineReducers({
  router: connectRouter(history),
});

export default rootReducer;