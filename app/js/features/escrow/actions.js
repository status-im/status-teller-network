import { CREATE_ESCROW } from './constants';

export const createEscrow = (buyer, value, expiration) => ({ type: CREATE_ESCROW, buyer, value, expiration });
