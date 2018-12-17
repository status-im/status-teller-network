import { EXAMPLE } from './constants';

function reducer(state = {}, action) {
  if (action.type === EXAMPLE) {
    return { example: true };
  }

  return state;
}

export default reducer;