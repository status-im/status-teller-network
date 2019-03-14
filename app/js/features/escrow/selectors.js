import moment from 'moment';
import { getOfferById } from '../metadata/selectors';
import { fromTokenDecimals } from '../../utils/numbers';
import { getTradeStatus } from './helpers';

export const getCreateEscrowStatus = state => state.escrow.createEscrowStatus;
export const getTrades = (state, offerIds) => {
  const escrows = state.escrow.escrows[offerIds] || [];
  return escrows.map((escrow) => {
    const offer = getOfferById(state, escrow.offerId);   
    return {
      ...escrow,
      status: getTradeStatus(escrow),
      amount: fromTokenDecimals(escrow.tradeAmount, offer.token.decimals),
      offer
    };
  });
};

// TODO: move to new UI
export const receipt = state => state.escrow.receipt;
export const error = state => state.escrow.error;
export const isLoading = state => state.escrow.loading;
export const txHash = state => state.escrow.txHash;
export const txHashList = state => state.escrow.txHashList;
export const escrows = state => state.escrow.escrows.map(escrow => {
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
