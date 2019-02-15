import { LOAD, ADD_OFFER, RESET_ADD_OFFER_STATUS, UPDATE_USER, RESET_UPDATE_USER_STATUS } from './constants';
import MetadataStore from 'Embark/contracts/MetadataStore';

export const load = (address) => ({ type: LOAD, address });

export const addOffer = (seller) => ({
  type: ADD_OFFER,
  toSend: MetadataStore.methods.addOffer(
    seller.asset,
    seller.statusContactCode,
    seller.location,
    seller.currency,
    seller.username,
    seller.paymentMethods,
    seller.marketType,
    seller.margin
  )
});

export const resetAddOfferStatus = () => ({
  type: RESET_ADD_OFFER_STATUS
});

export const updateUser = (user) => ({
  type: UPDATE_USER,
  user,
  toSend: MetadataStore.methods.updateUser(
    user.statusContactCode,
    user.location,
    user.username
  )
});

export const resetUpdateUserStatus = () => ({
  type: RESET_UPDATE_USER_STATUS
});
