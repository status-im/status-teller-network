import {SET_CONTACT, SET_OFFER_ID, SET_TRADE} from './constants';

const DEFAULT_STATE = {};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_CONTACT:
      return {
        ...state, ...{
          nickname: action.nickname,
          contactCode: action.contactCode
        }
      };
    case SET_OFFER_ID:
      return {
        ...state, ...{
          offerId: action.offerId
        }
      };
    case SET_TRADE:
      return {
        ...state, ...{
          fiatQty: action.fiatQty,
          assetQty: action.assetQty
        }
      };
    default:
      return state;
  }
}

export default reducer;
