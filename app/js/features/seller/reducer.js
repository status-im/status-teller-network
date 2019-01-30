import {SET_FIAT, SET_MARGIN, SET_SELECTED_ASSET, SET_LOCATION, SET_PAYMENT_METHODS} from './constants';

const DEFAULT_STATE = {fiat: null, rate: null, isAbove: true, location: ''};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_FIAT:
      return {...state, ...{
          fiat: action.fiat
        }};
    case SET_SELECTED_ASSET:
      return {...state, ...{
          selectedAsset: action.selectedAsset
        }};
    case SET_LOCATION:
      return {...state, ...{
          location: action.location
        }};
    case SET_PAYMENT_METHODS:
      return {...state, ...{
          paymentMethods: action.paymentMethods
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
