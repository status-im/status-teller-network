export const receipt = state => state.escrow.receipt;
export const error = state => state.escrow.error;
export const escrows = state => state.escrow.escrows.map(escrow => {
  escrow.rating = (typeof escrow.rating === 'string') ? parseInt(escrow.rating, 10) : escrow.rating;
  return escrow;
});
export const errorGet = state => state.escrow.errorGet;
export const loading = state => state.escrow.loading;
export const signature = state => {
  const {signedMessage, escrowId, type} = state.escrow;
  return {signedMessage, escrowId, type};
};

