export const fiat = state => state.seller.fiat || {};

export const selectedAsset = state => state.seller.selectedAsset;

export const location = state => state.seller.location;

export const paymentMethods = state => state.seller.paymentMethods || [];

export const contactCode = state => state.seller.contactCode || '';

export const nickname = state => state.seller.nickname || '';

export const margin = state => {
  const {rate, isAbove} = state.seller;
  return {rate, isAbove};
};
