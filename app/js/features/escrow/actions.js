import { CREATE_ESCROW, GET_ESCROWS, RELEASE_ESCROW, CANCEL_ESCROW, RATE_TRANSACTION, PAY_ESCROW, OPEN_CASE, PAY_ESCROW_SIGNATURE, CLOSE_DIALOG } from './constants';

export const createEscrow = (buyer, value, expiration) => ({ type: CREATE_ESCROW, buyer, value, expiration });

export const getEscrows = () => ({ type: GET_ESCROWS });

export const releaseEscrow = (escrowId) => ({ type: RELEASE_ESCROW, escrowId });

export const payEscrow = (escrowId) => ({ type: PAY_ESCROW, escrowId });

export const payEscrowSignature = (escrowId) => ({ type: PAY_ESCROW_SIGNATURE, escrowId });

export const openCase = (escrowId) => ({ type: OPEN_CASE, escrowId});

export const cancelEscrow = (escrowId) => ({ type: CANCEL_ESCROW, escrowId });

export const rateTransaction = (escrowId, rating) => ({ type: RATE_TRANSACTION, escrowId, rating });

export const closeDialog = () => ({ type: CLOSE_DIALOG });
