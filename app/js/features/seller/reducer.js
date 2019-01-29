import {
  SET_FIAT,
  SET_MARGIN
} from './constants';

const DEFAULT_STATE = {fiat: null, rate: null, isAbove: true};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_FIAT:
      return {...state, ...{
          fiat: action.fiat
        }};
    case SET_MARGIN:
        return{...state, ...{
          rate: action.rate,
          isAbove: action.isAbove
        }};
    default:
      return state;
  }
}

export default reducer;
