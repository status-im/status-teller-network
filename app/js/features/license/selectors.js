export const isLicenseOwner = state => state.license.licenseOwner;
export const isLoading = state => state.license.loading;
export const userRating = state => parseInt(state.license.userRating, 10);
export const isError = state => !!state.license.error;
export const txHash = state => state.license.txHash;
export const licenseOwners = state => state.license.licenseOwners;
export const licenseOwnersError = state => state.license.licenseOwnersError;
export const getLicensePrice = state => state.license.price;
