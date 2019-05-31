import {RESET_STATE, PURGE_STATE} from "../network/constants";
import {WATCH_ESCROW} from "../escrow/constants";

const DEFAULT_STATE = {
  escrows: {}
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case WATCH_ESCROW:
      return {
        ...state,
        escrows: {
          ...state.escrows,
          [action.escrowId]: true
        }
      };
    case PURGE_STATE:
    case RESET_STATE: {
      return DEFAULT_STATE;
    }
    default:
      return state;
  }
}

export default reducer;
