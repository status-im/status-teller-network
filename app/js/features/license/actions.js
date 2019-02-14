import { BUY_LICENSE, CHECK_LICENSE_OWNER, USER_RATING, ADD_USER_RATING, GET_LICENSE_OWNERS, LOAD_PRICE } from './constants';

export const buyLicense = () => ({ type: BUY_LICENSE });

export const loadPrice = () => ({ type: LOAD_PRICE });

export const checkLicenseOwner = () => ({ type: CHECK_LICENSE_OWNER });

export const getLicenseOwners = () => ({ type: GET_LICENSE_OWNERS });

export const checkUserRating = () => ({ type: USER_RATING });

export const addUserRating = () => ({ type: ADD_USER_RATING });
