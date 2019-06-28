import {ARBITRATION_UNSOLVED, GET_DISPUTED_ESCROWS, RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED, BUY_LICENSE, CHECK_LICENSE_OWNER, LOAD_PRICE, LOAD_ARBITRATION, GET_ARBITRATORS, OPEN_DISPUTE, CANCEL_DISPUTE} from './constants';
import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import OwnedUpgradeabilityProxy from '../../../embarkArtifacts/contracts/OwnedUpgradeabilityProxy';
Escrow.options.address = OwnedUpgradeabilityProxy.options.address;

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
    toSend: Escrow.methods.setArbitrationResult(escrowId, result)
  };
};

export const openDispute = (escrowId, motive) => ({type: OPEN_DISPUTE, escrowId, toSend: Escrow.methods.openCase(escrowId, motive || '')});

export const cancelDispute = (escrowId) => ({type: CANCEL_DISPUTE, escrowId, toSend: Escrow.methods.cancelArbitration(escrowId)});

export const loadArbitration = (escrowId) => {
  return {type: LOAD_ARBITRATION, escrowId};
};

export const getArbitrators = () => ({type: GET_ARBITRATORS});

export const buyLicense = () => ({ type: BUY_LICENSE });

export const loadPrice = () => ({ type: LOAD_PRICE });

export const checkLicenseOwner = () => ({ type: CHECK_LICENSE_OWNER });
