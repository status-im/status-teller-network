import { LOAD, ADD_OFFER } from './constants';
import MetadataStore from 'Embark/contracts/MetadataStore';

export const load = (address) => ({ type: LOAD, address });

export const addOffer = (seller) => ({
  type: ADD_OFFER,
  toSend: MetadataStore.methods.add(
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
