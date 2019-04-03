import { fromTokenDecimals } from '../../utils/numbers';

export const receipt = state => state.arbitration.receipt;
export const error = state => state.arbitration.error;
export const escrows = state => state.arbitration.escrows;
export const errorGet = state => state.arbitration.errorGet;
export const loading = state => state.arbitration.loading;
export const txHash = state => state.arbitration.txHash;

export const getArbitration = (state) => {
  const arbitration = state.arbitration.arbitration;
  if(!arbitration) return null;
  const token = Object.values(state.network.tokens).find((token) => token.address === arbitration.offer.asset);
  return {
    ...arbitration,
    token,
    tokenAmount: fromTokenDecimals(arbitration.tradeAmount, token.decimals)
  };
};

