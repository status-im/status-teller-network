/*global web3*/

import {
  EMBARKJS_INIT_SUCCEEDED
} from './constants';
import { Networks, Tokens } from '../../utils/networks';

const DEFAULT_STATE = {
  ready: false,
  address: '',
  network: {
    id: 0,
    name: ''
  },
  tokens: []
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case EMBARKJS_INIT_SUCCEEDED: {
      const name = Networks[action.networkId];
      return {
        ready: true,
        address: web3.eth.defaultAccount,
        network: {
          id: action.networkId,
          name
        },
        tokens: Tokens[name]
      };
    }
    default:
      return state;
  }
}

export default reducer;
