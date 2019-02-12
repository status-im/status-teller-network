import { LOAD, ADD_SELLER } from './constants';
import MetadataStore from 'Embark/contracts/MetadataStore';

export const load = (address) => ({ type: LOAD, address });

export const addSeller = (seller) => ({ 
  type: ADD_SELLER, 
  toSend: MetadataStore.methods.add(SNT.address, License.address, "London", "USD", "Iuri", [0], 0, 101)
});
