import { LOAD, ADD_SELLER } from './constants';

export const load = (address) => ({ type: LOAD, address });

export const addSeller = (seller) => ({ type: ADD_SELLER, seller });
