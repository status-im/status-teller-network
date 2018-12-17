import { BUY_LICENSE, CHECK_LICENSE_OWNER } from './constants';

export const buyLicense = () => ({ type: BUY_LICENSE });

export const checkLicenseOwner = () => ({ type: CHECK_LICENSE_OWNER });
