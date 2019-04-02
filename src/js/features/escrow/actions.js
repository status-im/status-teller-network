/* global web3 */
import {
  CREATE_ESCROW, RESET_CREATE_ESCROW_STATUS, LOAD_ESCROWS, RELEASE_ESCROW, CANCEL_ESCROW,
  RATE_TRANSACTION, PAY_ESCROW, OPEN_CASE, OPEN_CASE_SIGNATURE, PAY_ESCROW_SIGNATURE, CLOSE_DIALOG,
  ADD_USER_RATING, USER_RATING, GET_ESCROW, GET_FEE, FUND_ESCROW, RESET_STATUS
} from './constants';

import Escrow from '../../../embarkArtifacts/contracts/Escrow';

import { toTokenDecimals } from '../../utils/numbers';
import { zeroAddress } from '../../utils/address';

export const createEscrow = (buyerAddress, username, tradeAmount, assetPrice, statusContactCode, offer) => {
  tradeAmount = toTokenDecimals(tradeAmount, offer.token.decimals);
  return {
    type: CREATE_ESCROW,
    toSend: Escrow.methods.create(buyerAddress, offer.id, tradeAmount, 1, assetPrice, statusContactCode, '', username)
  };
};

export const fundEscrow = (escrow) => {
  const token = web3.utils.toChecksumAddress(escrow.offer.asset);
  const expirationTime = Math.floor((new Date()).getTime() / 1000) + (86400 * 2); // TODO: what will be the expiration time?
  let value = escrow.tradeAmount;

  let toSend = Escrow.methods.fund(escrow.escrowId, value, expirationTime);

  if(token === zeroAddress){
    return {
      type: FUND_ESCROW,
      toSend,
      value
    };
  }

  return {
    type: FUND_ESCROW,
    toSend
  };

  /*
  TODO: attempt to remove SNT approval if token is different from SNT, and send an approveAndCall trx

    let SNTAmount = feeAmount;
    if(token === SNT.options.address){
      SNTAmount = toBN(SNTAmount).add(toBN(value)).toString();
    }

    const encodedCall = toSend.encodeABI();
    toSend = SNT.methods.approveAndCall(Escrow.options.address, SNTAmount, encodedCall);
  }*/
};

export const releaseEscrow = (escrowId) => ({ type: RELEASE_ESCROW, escrowId, toSend: Escrow.methods.release(escrowId) });

export const payEscrow = (escrowId) => ({ type: PAY_ESCROW, escrowId, toSend: Escrow.methods.pay(escrowId) });

export const loadEscrows = (address) => ({ type: LOAD_ESCROWS, address });

export const getEscrow = (escrowId) => ({ type: GET_ESCROW, escrowId });

export const getFee = () => ({ type: GET_FEE });

// TODO: Update with new UI

export const payEscrowSignature = (escrowId) => ({ type: PAY_ESCROW_SIGNATURE, escrowId });

export const openCase = (escrowId) => ({ type: OPEN_CASE, escrowId, toSend: Escrow.methods.openCase(escrowId)});

export const openCaseSignature = (escrowId) => ({ type: OPEN_CASE_SIGNATURE, escrowId });

export const cancelEscrow = (escrowId) => ({ type: CANCEL_ESCROW, escrowId, toSend: Escrow.methods.cancel(escrowId) });

export const rateTransaction = (escrowId, rating) => ({ type: RATE_TRANSACTION, escrowId, rating, toSend: Escrow.methods.rateTransaction(escrowId, rating) });

export const closeDialog = () => ({ type: CLOSE_DIALOG });

export const checkUserRating = (address) => ({ type: USER_RATING, address });

export const addUserRating = () => ({ type: ADD_USER_RATING });

export const resetStatus = () => ({type: RESET_STATUS});
