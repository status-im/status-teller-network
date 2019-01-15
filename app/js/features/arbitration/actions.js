import { GET_DISPUTED_ESCROWS, RESOLVE_DISPUTE } from './constants';

export const getDisputedEscrows = () => ({ type: GET_DISPUTED_ESCROWS });

export const resolveDispute = (escrowId, result) => ({ type: RESOLVE_DISPUTE, escrowId, result: result.toString() });
