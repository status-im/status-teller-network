import { APPROVE_TOKEN, GET_SNT_ALLOWANCE } from './constants';
import ERC20Token from 'Embark/contracts/ERC20Token';
import Escrow from 'Embark/contracts/Escrow';


export const approve = (tokenAddress, amount) => {
  ERC20Token.options.address = tokenAddress;  
  return {
    type: APPROVE_TOKEN,
    toSend: ERC20Token.methods.approve(Escrow.options.address, amount)
  };
};

export const getSNTAllowance = () => ({ type: GET_SNT_ALLOWANCE});
