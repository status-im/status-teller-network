import { BUY_LICENSE, CHECK_LICENSE_OWNER, GET_LICENSE_OWNERS, LOAD_PRICE } from './constants';

export const buyLicense = () => ({ type: BUY_LICENSE });

export const loadPrice = () => ({ type: LOAD_PRICE });

export const checkLicenseOwner = () => ({ type: CHECK_LICENSE_OWNER });

export const getLicenseOwners = () => ({ type: GET_LICENSE_OWNERS });
