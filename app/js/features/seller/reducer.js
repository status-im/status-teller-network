import {
  SET_FIAT
} from './constants';

const DEFAULT_STATE = {fiat: null};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_FIAT:
      return {...state, ...{
          fiat: action.fiat
        }};
    default:
      return state;
  }
}

export default reducer;
