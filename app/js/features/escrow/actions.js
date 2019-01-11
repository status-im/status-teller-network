import { CREATE_ESCROW, GET_ESCROWS, RELEASE_ESCROW, CANCEL_ESCROW } from './constants';

export const createEscrow = (buyer, value, expiration) => ({ type: CREATE_ESCROW, buyer, value, expiration });

export const getEscrows = () => ({ type: GET_ESCROWS });

export const releaseEscrow = (escrowId) => ({ type: RELEASE_ESCROW, escrowId });

export const cancelEscrow = (escrowId) => ({ type: CANCEL_ESCROW, escrowId });
