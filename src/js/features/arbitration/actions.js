import {ARBITRATION_UNSOLVED, GET_DISPUTED_ESCROWS, RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED, BUY_LICENSE, CHECK_LICENSE_OWNER, LOAD_PRICE, LOAD_ARBITRATION, GET_ARBITRATORS, OPEN_DISPUTE, CANCEL_DISPUTE} from './constants';
import Arbitrations from '../../../embarkArtifacts/contracts/Arbitrations';
import EscrowInstance from '../../../embarkArtifacts/contracts/Escrow';

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
    result,
    toSend: Arbitrations.methods.setArbitrationResult(escrowId, result)
  };
};

export const openDispute = (escrowId, motive) => {
  EscrowInstance.options.address = escrowId;
  return {type: OPEN_DISPUTE, escrowId, toSend: EscrowInstance.methods.openCase(motive || '')};
};

export const cancelDispute = (escrowId) => ({type: CANCEL_DISPUTE, escrowId, toSend: Arbitrations.methods.cancelArbitration(escrowId)});

export const loadArbitration = (escrowId) => {
  return {type: LOAD_ARBITRATION, escrowId};
};

export const getArbitrators = () => ({type: GET_ARBITRATORS});

export const buyLicense = () => ({ type: BUY_LICENSE });

export const loadPrice = () => ({ type: LOAD_PRICE });

export const checkLicenseOwner = () => ({ type: CHECK_LICENSE_OWNER });
