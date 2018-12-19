import {
  EMBARKJS_INIT_SUCCEEDED
} from './constants';

const DEFAULT_STATE = {
  ready: false
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case EMBARKJS_INIT_SUCCEEDED:
      return {
        ready: true
      };
    default:
      return state;
  }
}

export default reducer;
