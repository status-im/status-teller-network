import { LOAD_SNT_BALANCE } from './constants';

export const loadSNTBalance = (address) => ({ type: LOAD_SNT_BALANCE, address });
