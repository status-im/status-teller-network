/* global web3 */

import moment from 'moment';
import { fromTokenDecimals } from '../../utils/numbers';
import { getTradeStatus, tradeStates } from './helpers';

const unimportantStates = [tradeStates.canceled, tradeStates.expired, tradeStates.released];

export const getCreateEscrowStatus = state => state.escrow.createEscrowStatus;

export const getFundEscrowStatus = state => state.escrow.fundEscrowStatus;

export const getReleaseEscrowStatus = state => state.escrow.releaseStatus;

export const getPaidEscrowStatus = state => state.escrow.payStatus;

export const getCancelEscrowStatus = state => state.escrow.cancelStatus;

export const getCreateEscrowId = state => state.escrow.createEscrowId;

export const getRatingStatus = state => state.escrow.rateStatus;

export const getTrades = (state, userAddress, offers) => {
  const escrows = state.escrow.escrows || {};
  return Object.values(escrows).filter(escrow => escrow.buyer === userAddress || offers.find(x => x.toString() === escrow.offerId.toString()) !== undefined)
                .map((escrow) => {
                  const token = Object.values(state.network.tokens).find((token) => web3.utils.toChecksumAddress(token.address) === web3.utils.toChecksumAddress(escrow.offer.asset));
                  return {
                    ...escrow,
                    token,
                    status: getTradeStatus(escrow),
                    tokenAmount: fromTokenDecimals(escrow.tradeAmount, token.decimals)
                  };
                })
    .sort((a, b) => {
      if (unimportantStates.includes(a.status)) {
        if (unimportantStates.includes(b.status)) {
          return (parseInt(a.escrowId, 10) < parseInt(b.escrowId, 10)) ? 1 : -1;
        }
        return 1;
      }
      if (unimportantStates.includes(b.status)) {
        return -1;
      }
      return (parseInt(a.escrowId, 10) < parseInt(b.escrowId, 10)) ? 1 : -1;
    });
};

export const getEscrowById = (state, escrowId) => {
  if (!state.escrow.escrows) {
    return null;
  }
  const escrow = state.escrow.escrows[escrowId];
  if(!escrow) return null;

  const token = Object.values(state.network.tokens).find((token) => web3.utils.toChecksumAddress(token.address) === web3.utils.toChecksumAddress(escrow.offer.asset));
  return {
    ...escrow,
    token,
    status: getTradeStatus(escrow),
    tokenAmount: fromTokenDecimals(escrow.tradeAmount, token.decimals)
  };
};

export const getFee = state => state.escrow.fee;
export const txHash = state => state.escrow.txHash;

// TODO: move to new UI
export const receipt = state => state.escrow.receipt;
export const error = state => state.escrow.error;
export const isLoading = state => state.escrow.loading;
export const txHashList = state => state.escrow.txHashList;
export const escrows = state => Object.values(state.escrow.escrows).map(escrow => {
  escrow.rating = (typeof escrow.rating === 'string') ? parseInt(escrow.rating, 10) : escrow.rating;
  if (!escrow.expirationTime.unix) {
    escrow.expirationTime = moment(escrow.expirationTime * 1000);
  }
  return escrow;
});
export const errorGet = state => state.escrow.errorGet;
export const loadingList = state => state.escrow.loadingList;
export const signature = state => {
  const {
    message,
    escrowId,
    type
  } = state.escrow;
  return {
    message,
    escrowId,
    type
  };
};
