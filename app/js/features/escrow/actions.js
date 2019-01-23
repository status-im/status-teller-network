import { CREATE_ESCROW, GET_ESCROWS, RELEASE_ESCROW, CANCEL_ESCROW, RATE_TRANSACTION, PAY_ESCROW, OPEN_CASE,
  OPEN_CASE_SIGNATURE, PAY_ESCROW_SIGNATURE, CLOSE_DIALOG } from './constants';
import Escrow from 'Embark/contracts/Escrow';
const zeroAddress = '0x0000000000000000000000000000000000000000';

export const createEscrow = (buyer, value, expiration) => ({ type: CREATE_ESCROW, value, toSend: Escrow.methods.create(buyer, parseInt(value, 10), zeroAddress, expiration)});

export const getEscrows = () => ({ type: GET_ESCROWS });

export const releaseEscrow = (escrowId) => ({ type: RELEASE_ESCROW, escrowId, toSend: Escrow.methods.release(escrowId) });

export const payEscrow = (escrowId) => ({ type: PAY_ESCROW, escrowId, toSend: Escrow.methods.pay(escrowId) });

export const payEscrowSignature = (escrowId) => ({ type: PAY_ESCROW_SIGNATURE, escrowId });

export const openCase = (escrowId) => ({ type: OPEN_CASE, escrowId, toSend: Escrow.methods.openCase(escrowId)});

export const openCaseSignature = (escrowId) => ({ type: OPEN_CASE_SIGNATURE, escrowId });

export const cancelEscrow = (escrowId) => ({ type: CANCEL_ESCROW, escrowId, toSend: Escrow.methods.cancel(escrowId) });

export const rateTransaction = (escrowId, rating) => ({ type: RATE_TRANSACTION, escrowId, rating, toSend: Escrow.methods.rateTransaction(escrowId, rating) });

export const closeDialog = () => ({ type: CLOSE_DIALOG });
