import {ARBITRATION_UNSOLVED, GET_DISPUTED_ESCROWS, RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED, LOAD_ARBITRATION, GET_ARBITRATORS} from './constants';
import Escrow from '../../../embarkArtifacts/contracts/Escrow';

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

export const loadArbitration = (escrowId) => {
  return {type: LOAD_ARBITRATION, escrowId};
};

export const getArbitrators = () => ({type: GET_ARBITRATORS});
