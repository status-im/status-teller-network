import {
  LOAD_SNT_BALANCE_SUCCEEDED
} from './constants';
import Web3 from 'web3';

const DEFAULT_STATE = {
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case LOAD_SNT_BALANCE_SUCCEEDED: {
      const snt = Web3.utils.fromWei(action.value);
      return {
        ...state, [action.address]: { ...action.address, snt: parseInt(snt, 10) }
      };
    }
    default:
      return state;
  }
}

export default reducer;
