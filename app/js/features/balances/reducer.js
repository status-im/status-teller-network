import {
  LOAD_SNT_BALANCE_SUCCEEDED
} from './constants';

const DEFAULT_STATE = {
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case LOAD_SNT_BALANCE_SUCCEEDED:
      return {
        ...state, [action.address]: { ...action.address, snt: parseInt(action.value, 10) }
      };
    default:
      return state;
  }
}

export default reducer;
