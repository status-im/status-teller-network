import { FETCH_PRICES_SUCCEEDED } from './constants';

function reducer(state = {}, action) {
  switch (action.type) {
  case FETCH_PRICES_SUCCEEDED:
    return {
      ...state,
      ...action.data
    };
  default:
    return state;
  }
}

export default reducer;
