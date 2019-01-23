import {ARBITRATION_UNSOLVED, GET_DISPUTED_ESCROWS, RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED} from './constants';
import Escrow from 'Embark/contracts/Escrow';

export const getDisputedEscrows = () => ({type: GET_DISPUTED_ESCROWS});

export const resolveDispute = (escrowId, result) => {
  if (result === ARBITRATION_UNSOLVED) {
    return {
      type: RESOLVE_DISPUTE_FAILED,
      result: "Arbitration must have a result"
    };
  }
  return {
    type: RESOLVE_DISPUTE,
    escrowId,
    toSend: Escrow.methods.setArbitrationResult(escrowId, result)
  };
};
