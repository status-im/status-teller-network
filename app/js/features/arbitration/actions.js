import { GET_DISPUTED_ESCROWS, PAY_ESCROW } from './constants';

export const getDisputedEscrows = () => ({ type: GET_DISPUTED_ESCROWS });

export const payEscrow = (escrowId) => ({ type: PAY_ESCROW, escrowId });
