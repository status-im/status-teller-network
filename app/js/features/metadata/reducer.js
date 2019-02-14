import {
  LOAD_OFFERS_SUCCEEDED, LOAD_SELLER_SUCCEEDED,
  ADD_OFFER, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, RESET_ADD_OFFER_STATUS
} from './constants';

const DEFAULT_STATE = {
  addOfferStatus: "none",
  sellers: {},
  offers: {}
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_ADD_OFFER_STATUS:
    return {
      ...state, addOfferStatus: 'none'
    };
    case ADD_OFFER:
      return {
        ...state, addOfferStatus: 'pending'
      };
    case ADD_OFFER_SUCCEEDED:
      return {
        ...state, addOfferStatus: 'success'
      };
    case ADD_OFFER_FAILED:
      return {
        ...state, addOfferStatus: 'fail'
      };
    case LOAD_SELLER_SUCCEEDED:
      return {
        ...state, sellers: { ...state.sellers, [action.address]: action.seller}
      };
    case LOAD_OFFERS_SUCCEEDED:
      return {
        ...state, ...{
          offers: { ...state.offers, [action.address]: action.offers}
        }
      };
    default:
      return state;
  }
}

export default reducer;
