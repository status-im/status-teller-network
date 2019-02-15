import { UPDATE_BALANCES } from './constants';

export const update = (tokens, address) => ({ type: UPDATE_BALANCES, tokens, address });
