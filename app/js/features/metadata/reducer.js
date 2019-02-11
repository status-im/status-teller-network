import {
  LOAD_OFFERS_SUCCEEDED, LOAD_SELLER_SUCCEEDED
} from './constants';

const DEFAULT_STATE = {
  sellers: {},
  offers: {}
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
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
