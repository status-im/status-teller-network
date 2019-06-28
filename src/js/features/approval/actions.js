import { APPROVE_TOKEN, GET_SNT_ALLOWANCE, GET_TOKEN_ALLOWANCE, CANCEL_APPROVE_TOKEN } from './constants';
import ERC20Token from '../../../embarkArtifacts/contracts/ERC20Token';
import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import OwnedUpgradeabilityProxy from '../../../embarkArtifacts/contracts/OwnedUpgradeabilityProxy';
Escrow.options.address = OwnedUpgradeabilityProxy.options.address;

export const approve = (tokenAddress, amount) => {
  ERC20Token.options.address = tokenAddress;
  return {
    type: APPROVE_TOKEN,
    toSend: ERC20Token.methods.approve(Escrow.options.address, amount),
    amount
  };
};

export const cancelApproval = () => ({ type: CANCEL_APPROVE_TOKEN});

export const getSNTAllowance = () => ({ type: GET_SNT_ALLOWANCE});

export const getTokenAllowance = (token) => ({ type: GET_TOKEN_ALLOWANCE, token});

