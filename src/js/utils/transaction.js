export const States = {
  none: 'none',
  pending: 'pending',
  success: 'success',
  failed: 'failed'
};

export const calculateEscrowPrice = (escrow, prices) => {
  const price = prices[escrow.token.symbol][escrow.currency];
  return escrow.marketType === "0" ? price * ((100 + (parseFloat(escrow.margin))) / 100) : price * parseFloat(escrow.margin) / 100;
};
