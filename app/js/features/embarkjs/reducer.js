/*global web3*/

import {
  EMBARKJS_INIT_SUCCEEDED
} from './constants';
import { Networks } from '../../utils/networks';

const DEFAULT_STATE = {
  ready: false,
  address: '',
  network: {
    id: 0,
    name: ''
  }
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case EMBARKJS_INIT_SUCCEEDED:
      return {
        ready: true,
        address: web3.eth.defaultAccount,
        network: {
          id: action.networkId,
          name: Networks[action.networkId]
        }
      };
    default:
      return state;
  }
}

export default reducer;
