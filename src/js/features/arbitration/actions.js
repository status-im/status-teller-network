import {
  ARBITRATION_UNSOLVED,
  GET_DISPUTED_ESCROWS,
  RESOLVE_DISPUTE,
  RESOLVE_DISPUTE_FAILED,
  BUY_LICENSE,
  CANCEL_ARBITRATOR_SELECTION_ACTIONS,
  CHECK_LICENSE_OWNER,
  LOAD_PRICE,
  LOAD_ARBITRATION,
  GET_ARBITRATORS,
  OPEN_DISPUTE,
  CANCEL_DISPUTE,
  REQUEST_ARBITRATOR,
  CANCEL_ARBITRATOR_REQUEST,
  CHANGE_ACCEPT_EVERYONE,
  GET_ARBITRATION_REQUESTS,
  ACCEPT_ARBITRATOR_REQUEST,
  REJECT_ARBITRATOR_REQUEST,
  BLACKLIST_SELLER,
  UNBLACKLIST_SELLER,
  GET_BLACKLISTED_SELLERS
} from './constants';
import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import ArbitrationLicense from '../../../embarkArtifacts/contracts/ArbitrationLicense';
import ArbitrationLicenseProxy from '../../../embarkArtifacts/contracts/ArbitrationLicenseProxy';
import EscrowProxy from '../../../embarkArtifacts/contracts/EscrowProxy';

ArbitrationLicense.options.address = ArbitrationLicenseProxy.options.address;
Escrow.options.address = EscrowProxy.options.address;

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

export const getArbitrators = (address, includeAll) => ({type: GET_ARBITRATORS, address, includeAll});

export const buyLicense = () => ({ type: BUY_LICENSE });

export const loadPrice = () => ({ type: LOAD_PRICE });

export const checkLicenseOwner = () => ({ type: CHECK_LICENSE_OWNER });

export const requestArbitrator = (arbitrator) => ({ type: REQUEST_ARBITRATOR, arbitrator, toSend: ArbitrationLicense.methods.requestArbitrator(arbitrator) });

export const cancelArbitratorRequest = (arbitrator) => ({type: CANCEL_ARBITRATOR_REQUEST, arbitrator});

export const cancelArbitratorActions = () => ({type: CANCEL_ARBITRATOR_SELECTION_ACTIONS});

export const changeAcceptEveryone = (acceptAny) => ({type: CHANGE_ACCEPT_EVERYONE, acceptAny, toSend: ArbitrationLicense.methods.changeAcceptAny(acceptAny)});

export const getArbitratorRequests = () => ({type: GET_ARBITRATION_REQUESTS});

export const acceptRequest = (id) => ({type: ACCEPT_ARBITRATOR_REQUEST, id, toSend: ArbitrationLicense.methods.acceptRequest(id)});

export const rejectRequest = (id) => ({type: REJECT_ARBITRATOR_REQUEST, id, toSend: ArbitrationLicense.methods.rejectRequest(id)});

export const getBlacklistedSellers = () => ({type: GET_BLACKLISTED_SELLERS});

export const blacklistSeller = (sellerAddress) => ({type: BLACKLIST_SELLER, sellerAddress, toSend: ArbitrationLicense.methods.blacklistSeller(sellerAddress)});

export const unBlacklistSeller = (sellerAddress) => ({type: UNBLACKLIST_SELLER, sellerAddress, toSend: ArbitrationLicense.methods.unBlacklistSeller(sellerAddress)});
