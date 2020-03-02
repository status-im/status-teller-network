/*global web3*/
import {
  CREATE_ESCROW, RELEASE_ESCROW, CANCEL_ESCROW,
  RATE_TRANSACTION, PAY_ESCROW, OPEN_CASE, GET_ESCROW, FUND_ESCROW, RESET_STATUS,
  WATCH_ESCROW, WATCH_ESCROW_CREATIONS, CLEAR_NEW_ESCROW, GET_LAST_ACTIVITY, RESET_CREATE_STATUS,
  GET_FEE_MILLI_PERCENT
} from './constants';

import { toTokenDecimals } from '../../utils/numbers';
import EscrowInstance from '../../../embarkArtifacts/contracts/EscrowInstance';

export const createEscrow = (username, tokenAmount, currencyQuantity, contactData, offer) => {
  tokenAmount = toTokenDecimals(tokenAmount, offer.token.decimals);
  return {
    type: CREATE_ESCROW,
    user: {
      contactData,
      username
    },
    escrow: {
      tokenAmount,
      offerId: offer.id,
      currencyQuantity: parseFloat(currencyQuantity).toFixed(2).toString().replace('.', '')
    }
  };
};

export const fundEscrow = (escrow) => {
  const value = toTokenDecimals(escrow.tokenAmount, escrow.token.decimals);
  return {
    type: FUND_ESCROW,
    value,
    escrowId: escrow.escrowId,
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

export const releaseEscrow = (escrowId) => ({ type: RELEASE_ESCROW, escrowId, toSend: EscrowInstance.methods.release(escrowId) });

export const payEscrow = (escrowId) => ({ type: PAY_ESCROW, escrowId, toSend: EscrowInstance.methods.pay(escrowId) });

export const getEscrow = (escrowId) => ({ type: GET_ESCROW, escrowId });

export const getLastActivity = (address) => ({ type: GET_LAST_ACTIVITY, address});

export const cancelEscrow = (escrowId) => {
  return { type: CANCEL_ESCROW, escrowId, toSend: EscrowInstance.methods.cancel(escrowId) };
};

export const rateTransaction = (escrowId, rating, ratingSeller) => ({ type: RATE_TRANSACTION, escrowId, rating, ratingSeller, toSend: EscrowInstance.methods.rateTransaction(escrowId, rating) });

export const resetCreateStatus = () => ({type: RESET_CREATE_STATUS});
export const resetStatus = (escrowId) => ({type: RESET_STATUS, escrowId});

export const watchEscrow = (escrowId) => ({type: WATCH_ESCROW, escrowId});
export const watchEscrowCreations = (offers) => ({type: WATCH_ESCROW_CREATIONS, offers});

export const clearNewEscrow = () => ({type: CLEAR_NEW_ESCROW});
export const clearChangedEscrow = () => ({type: CLEAR_NEW_ESCROW});

// TODO: Update with new UI

export const openCase = (escrowId) => ({ type: OPEN_CASE, escrowId, toSend: EscrowInstance.methods.openCase(escrowId)});

export const getFeeMilliPercent = () => ({ type: GET_FEE_MILLI_PERCENT });
