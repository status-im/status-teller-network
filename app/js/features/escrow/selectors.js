import moment from 'moment';

export const receipt = state => state.escrow.receipt;
export const error = state => state.escrow.error;
export const escrows = state => state.escrow.escrows.map(escrow => {
  escrow.rating = (typeof escrow.rating === 'string') ? parseInt(escrow.rating, 10) : escrow.rating;
  escrow.expirationTime = moment(escrow.expirationTime * 1000);
  return escrow;
});
export const errorGet = state => state.escrow.errorGet;
export const loading = state => state.escrow.loading;
export const signature = state => {
  const {message, escrowId, type} = state.escrow;
  return {message, escrowId, type};
};

