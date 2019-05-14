import { fromTokenDecimals } from '../../utils/numbers';

export const receipt = state => state.arbitration.receipt;
export const error = state => state.arbitration.error;
export const escrows = state => state.arbitration.escrows;
export const errorGet = state => state.arbitration.errorGet;
export const loading = state => state.arbitration.loading;
export const txHash = state => state.arbitration.txHash;
export const arbitrators = state => state.arbitration.arbitrators;

export const getArbitration = (state) => {
  const arbitration = state.arbitration.arbitration;
  if(!arbitration) return null;
  
  const token = Object.values(state.network.tokens).find((token) => token.address === arbitration.offer.asset);
  if(!token) return null;

  return {
    ...arbitration,
    token,
    tokenAmount: fromTokenDecimals(arbitration.tradeAmount, token.decimals)
  };
};

export const isLicenseOwner = state => state.arbitration.licenseOwner;
export const isLoading = state => state.arbitration.loading;
export const getLicensePrice = state => parseInt(state.arbitration.price, 10);
