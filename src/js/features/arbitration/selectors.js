import { fromTokenDecimals } from '../../utils/numbers';
import {addressCompare, toChecksumAddress} from '../../utils/address';

export const receipt = state => state.arbitration.receipt;
export const error = state => state.arbitration.error;
export const escrows = state => state.arbitration.escrows;
export const errorGet = state => state.arbitration.errorGet;
export const loading = state => state.arbitration.loading;
export const txHash = state => state.arbitration.txHash;
export const arbitrators = state => state.arbitration.arbitrators;
export const arbitratorScore = state => arbitrator => state.arbitration.arbitratorScores[toChecksumAddress(arbitrator)];
export const fallbackArbitrator = state => state.arbitration.fallbackArbitrator;
export const isFallbackArbitrator = state => state.arbitration.isFallbackArbitrator;

export const getArbitration = (state) => {
  const arbitration = state.arbitration.arbitration;
  if (!arbitration || !arbitration.offer) return null;

  const token = Object.values(state.network.tokens).find((token) => addressCompare(token.address, arbitration.offer.asset));
  if(!token) return null;

  return {
    ...arbitration,
    token,
    tokenAmount: fromTokenDecimals(arbitration.tokenAmount, token.decimals)
  };
};

export const isLicenseOwner = state => state.arbitration.licenseOwner;
export const acceptsEveryone = state => state.arbitration.acceptAny;
export const isLoading = state => state.arbitration.loading;
export const getLicensePrice = state => parseInt(state.arbitration.price, 10);

export const getArbitratorRequests = state => state.arbitration.arbitratorRequests;

export const getBlacklistedSellers = state => state.arbitration.blacklistedSellers;

export const actionNeeded = state => state.arbitration.actionNeeded;
