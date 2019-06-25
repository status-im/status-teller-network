/*global web3*/
import {
  CREATE_ESCROW, LOAD_ESCROWS, RELEASE_ESCROW, CANCEL_ESCROW,
  RATE_TRANSACTION, PAY_ESCROW, CLOSE_DIALOG,
  ADD_USER_RATING, USER_RATING, GET_ESCROW, FUND_ESCROW, RESET_STATUS,
  WATCH_ESCROW, WATCH_ESCROW_CREATIONS, CLEAR_NEW_ESCROW, GET_LAST_ACTIVITY, RESET_CREATE_STATUS,
  GET_FEE_MILLI_PERCENT
} from './constants';

import EscrowInstance from '../../../embarkArtifacts/contracts/Escrow';

import { toTokenDecimals } from '../../utils/numbers';

export const createEscrow = (signature, username, tradeAmount, assetPrice, statusContactCode, offer, nonce) => {
  tradeAmount = toTokenDecimals(tradeAmount, offer.token.decimals);
  return {
    type: CREATE_ESCROW,
    user: {
      statusContactCode,
      username,
      signature,
      nonce
    },
    escrow: {
      tradeAmount,
      offerId: offer.id,
      assetPrice
    }
  };
};

export const fundEscrow = (escrow) => {
  const expirationTime = Math.floor((new Date()).getTime() / 1000) + (86400 * 2); // TODO: what will be the expiration time?
  const value = escrow.tradeAmount;

  return {
    type: FUND_ESCROW,
    value,
    escrowId: escrow.escrowId,
    expirationTime,
    token: web3.utils.toChecksumAddress(escrow.offer.asset)
  };

  /*
  TODO: attempt to remove SNT approval if token is different from SNT, and send an approveAndCall trx

    let SNTAmount = feeAmount;
    if(addressCompare(token, SNT.options.address)){
      SNTAmount = toBN(SNTAmount).add(toBN(value)).toString();
    }

    const encodedCall = toSend.encodeABI();
    toSend = SNT.methods.approveAndCall(Escrow.options.address, SNTAmount, encodedCall);
  }*/
};

export const releaseEscrow = (escrowId) => {
  EscrowInstance.options.address = escrowId;
  return { type: RELEASE_ESCROW, escrowId, toSend: EscrowInstance.methods.release() };
};

export const payEscrow = (escrowId) => {
  EscrowInstance.options.address = escrowId;
  return { type: PAY_ESCROW, escrowId, toSend: EscrowInstance.methods.pay() };
};

export const loadEscrows = (address) => ({ type: LOAD_ESCROWS, address });

export const getEscrow = (escrowId) => ({ type: GET_ESCROW, escrowId });

export const getLastActivity = (address) => ({ type: GET_LAST_ACTIVITY, address});

export const cancelEscrow = (escrowId) => {
  EscrowInstance.options.address = escrowId;
  return { type: CANCEL_ESCROW, escrowId, toSend: EscrowInstance.methods.cancel() };
};

export const rateTransaction = (escrowId, rating) => {
  EscrowInstance.options.address = escrowId;
  return { type: RATE_TRANSACTION, escrowId, rating, toSend: EscrowInstance.methods.rateTransaction(rating) };
};

export const resetCreateStatus = () => ({type: RESET_CREATE_STATUS});
export const resetStatus = (escrowId) => ({type: RESET_STATUS, escrowId});

export const watchEscrow = (escrowId) => ({type: WATCH_ESCROW, escrowId});
export const watchEscrowCreations = (offers) => ({type: WATCH_ESCROW_CREATIONS, offers});

export const clearNewEscrow = () => ({type: CLEAR_NEW_ESCROW});
export const clearChangedEscrow = () => ({type: CLEAR_NEW_ESCROW});

export const closeDialog = () => ({ type: CLOSE_DIALOG });

export const checkUserRating = (address) => ({ type: USER_RATING, address });

export const addUserRating = () => ({ type: ADD_USER_RATING });

export const getFeeMilliPercent = () => ({ type: GET_FEE_MILLI_PERCENT });
