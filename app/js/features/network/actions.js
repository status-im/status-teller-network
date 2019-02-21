import { INIT, UPDATE_BALANCES, UPDATE_BALANCE, GET_CONTACT_CODE  } from './constants';

export const init = () => ({ type: INIT });
export const updateBalances = (address) => ({ type: UPDATE_BALANCES, address });
export const updateBalance = (symbol, address) => ({ type: UPDATE_BALANCE, symbol, address });
export const getContactCode = () => ({type: GET_CONTACT_CODE});
