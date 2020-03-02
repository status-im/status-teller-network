/* global web3 */

import {fork, put, takeEvery} from 'redux-saga/effects';
import {doTransaction} from '../../utils/saga';
import {zeroAddress} from '../../utils/address';
import {toTokenDecimals} from '../../utils/numbers';
import SNT from '../../../embarkArtifacts/contracts/SNT';
import ERC20Token from '../../../embarkArtifacts/contracts/ERC20Token';
import { APPROVE_TOKEN, APPROVE_PRE_SUCCEEDED, APPROVE_SUCCEEDED, APPROVE_FAILED, GET_SNT_ALLOWANCE, GET_SNT_ALLOWANCE_SUCCEEDED, GET_SNT_ALLOWANCE_FAILED, GET_TOKEN_ALLOWANCE, GET_TOKEN_ALLOWANCE_FAILED, GET_TOKEN_ALLOWANCE_SUCCEEDED } from './constants';
import EscrowInstance from '../../../embarkArtifacts/contracts/EscrowInstance';

const {toBN} = web3.utils;

export function *approveToken({amount, tokenDecimals}) {
  const feeMilliPercent = yield EscrowInstance.methods.feeMilliPercent().call();
  const amountWei = toBN(toTokenDecimals(amount, tokenDecimals || 18));
  const divider = 100 * (feeMilliPercent / 1000);
  const feeAmount =  amountWei.div(toBN(divider));

  const toSend = ERC20Token.methods.approve(EscrowInstance.options.address, (amountWei.add(feeAmount)).toString());
  yield doTransaction(APPROVE_PRE_SUCCEEDED, APPROVE_SUCCEEDED, APPROVE_FAILED, {toSend});
}

export function *onApproveToken() {
  yield takeEvery(APPROVE_TOKEN, approveToken);
}

export function *doGetSNTAllowance() {
  if(!web3.eth.defaultAccount) return;

  try {
    const allowance = yield SNT.methods.allowance(web3.eth.defaultAccount, EscrowInstance.options.address).call();
    yield put({type: GET_SNT_ALLOWANCE_SUCCEEDED, allowance});
  } catch (error) {
    console.error(error);
    yield put({type: GET_SNT_ALLOWANCE_FAILED, error: error.message});
  }
}

export function *doGetTokenAllowance({token}) {
  if(token === zeroAddress) return;

  try {
    ERC20Token.options.address = token;
    const allowance = yield ERC20Token.methods.allowance(web3.eth.defaultAccount, EscrowInstance.options.address).call();
    yield put({type: GET_TOKEN_ALLOWANCE_SUCCEEDED, allowance});
  } catch (error) {
    console.error(error);
    yield put({type: GET_TOKEN_ALLOWANCE_FAILED, error: error.message});
  }
}

export function *onGetSNTAllowance() {
  yield takeEvery(GET_SNT_ALLOWANCE, doGetSNTAllowance);
}

export function *onGetTokenAllowance() {
  yield takeEvery(GET_TOKEN_ALLOWANCE, doGetTokenAllowance);
}

export default [fork(onApproveToken), fork(onGetSNTAllowance), fork(onGetTokenAllowance)];
