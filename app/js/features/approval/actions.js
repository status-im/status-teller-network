import { APPROVE_TOKEN } from './constants';
import ERC20Token from 'Embark/contracts/ERC20Token';

export const approve = (tokenAddress,  contractToApprove, amount) => {
  ERC20Token.options.address = tokenAddress;  
  return {
    type: APPROVE_TOKEN,
    toSend: ERC20Token.methods.approve(contractToApprove, amount)
  };
};
