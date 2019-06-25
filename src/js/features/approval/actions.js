import { APPROVE_TOKEN, GET_SNT_ALLOWANCE, GET_TOKEN_ALLOWANCE, CANCEL_APPROVE_TOKEN } from './constants';
import ERC20Token from '../../../embarkArtifacts/contracts/ERC20Token';

export const approve = (tokenAddress, amount, escrowId) => {
  ERC20Token.options.address = tokenAddress;
  return {
    type: APPROVE_TOKEN,
    toSend: ERC20Token.methods.approve(escrowId, amount, escrowId),
    amount
  };
};

export const cancelApproval = (escrowId) => ({ type: CANCEL_APPROVE_TOKEN, escrowId});

export const getSNTAllowance = (escrowId) => ({ type: GET_SNT_ALLOWANCE, escrowId});

export const getTokenAllowance = (token, escrowId) => ({ type: GET_TOKEN_ALLOWANCE, token, escrowId});

