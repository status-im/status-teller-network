import { BUY_LICENSE, CHECK_LICENSE_OWNER, USER_RATING, ADD_USER_RATING } from './constants';

export const buyLicense = () => ({ type: BUY_LICENSE });

export const checkLicenseOwner = () => ({ type: CHECK_LICENSE_OWNER });

export const checkUserRating = () => ({ type: USER_RATING });

export const addUserRating = () => ({ type: ADD_USER_RATING });
