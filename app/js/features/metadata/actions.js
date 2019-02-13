import { LOAD, ADD_SELLER } from './constants';
import MetadataStore from 'Embark/contracts/MetadataStore';

export const load = (address) => ({ type: LOAD, address });

export const addSeller = (seller) => ({ 
  type: ADD_SELLER, 
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
