import moment from 'moment';
import { fromTokenDecimals } from '../../utils/numbers';
import { getTradeStatus } from './helpers';

export const getCreateEscrowStatus = state => state.escrow.createEscrowStatus;

export const getCreateEscrowId = state => state.escrow.createEscrowId;

export const getTrades = (state) => {
  const escrows = state.escrow.escrows || [];
  return escrows.map((escrow) => {
    const token = Object.values(state.network.tokens).find((token) => token.address === escrow.offer.asset);
    return {
      ...escrow,
      token,
      status: getTradeStatus(escrow),
      tokenAmount: fromTokenDecimals(escrow.tradeAmount, token.decimals)
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
