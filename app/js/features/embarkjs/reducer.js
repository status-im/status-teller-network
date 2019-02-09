/*global web3*/

import {
  EMBARKJS_INIT_SUCCEEDED
} from './constants';

const DEFAULT_STATE = {
  ready: false,
  address: ''
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case EMBARKJS_INIT_SUCCEEDED:
      return {
        ready: true,
        address: web3.eth.defaultAccount
      };
    default:
      return state;
  }
}

export default reducer;
