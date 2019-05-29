export const States = {
  none: 'none',
  pending: 'pending',
  success: 'success',
  failed: 'failed'
};

export const calculateEscrowPrice = (escrow, prices) => {
  return prices[escrow.token.symbol][escrow.currency] * ((100 + (parseFloat(escrow.margin))) / 100);
};
