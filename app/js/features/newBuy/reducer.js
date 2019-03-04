import {SET_CONTACT_INFO, SET_TRADE, SET_OFFER_ID} from './constants';

const DEFAULT_STATE = {
  currencyQuantity: 0,
  assetQuantity: 0
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_OFFER_ID:
      return {
        ...state, offerId: parseInt(action.offerId, 10)
      };
    case SET_CONTACT_INFO:
      return {
        ...state,
        username: action.username,
        statusContactCode: action.statusContactCode
      };
    case SET_TRADE:
      return {
        ...state,
        currencyQuantity: action.currencyQuantity,
        assetQuantity: action.assetQuantity
      };
    default:
      return state;
  }
}

export default reducer;
