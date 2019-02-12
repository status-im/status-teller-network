import {
  SET_CURENCY,
  SET_MARGIN,
  SET_ASSET,
  SET_LOCATION,
  SET_PAYMENT_METHODS,
  SET_CONTACT_INFO
} from './constants';

const DEFAULT_STATE = {
  asset: '',
  statusContractCode: '',
  location: '',
  currency: '',
  username: '',
  paymentMethods: [],
  marketType: 0,
  margin: 0
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_CURENCY:
      return {
        ...state,
        currency: action.currency
      };
    case SET_ASSET:
      return {
        ...state,
        asset: action.asset
      };
    case SET_LOCATION:
      return {
        ...state,
        location: action.location
      };
    case SET_PAYMENT_METHODS:
      return {
        ...state,
        paymentMethods: action.paymentMethods
      };
    case SET_MARGIN:
      return {
        ...state,
        margin: action.margin,
        marketType: action.marketType
      };
    case SET_CONTACT_INFO:
      return {
        ...state,
        username: action.nickname,
        statusContractCode: action.contactCode
      };
    default:
      return state;
  }
}

export default reducer;
