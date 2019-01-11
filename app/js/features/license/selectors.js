export const isLicenseOwner = state => state.license.licenseOwner;
export const userRating = state => parseInt(state.license.userRating, 10);
export const error = state => state.license.error;
export const licenseOwners = state => state.license.licenseOwners;
export const licenseOwnersError = state => state.license.licenseOwnersError;
