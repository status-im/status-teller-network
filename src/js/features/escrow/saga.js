/*global web3*/
import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import MetadataStore from '../../../embarkArtifacts/contracts/MetadataStore';

import {fork, takeEvery, call, put, select, all} from 'redux-saga/effects';
import {doTransaction} from '../../utils/saga';
import {
  CREATE_ESCROW, CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW_PRE_SUCCESS,
  LOAD_ESCROWS, LOAD_ESCROWS_FAILED, LOAD_ESCROWS_SUCCEEDED,
  RELEASE_ESCROW, RELEASE_ESCROW_FAILED, RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW_PRE_SUCCESS,
  CANCEL_ESCROW, CANCEL_ESCROW_FAILED, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW_PRE_SUCCESS,
  RATE_TRANSACTION, RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_PRE_SUCCESS,
  PAY_ESCROW, PAY_ESCROW_FAILED, PAY_ESCROW_SUCCEEDED, PAY_ESCROW_PRE_SUCCESS,
  FUND_ESCROW, FUND_ESCROW_FAILED, FUND_ESCROW_SUCCEEDED, FUND_ESCROW_PRE_SUCCESS,
  OPEN_CASE, OPEN_CASE_FAILED, OPEN_CASE_SUCCEEDED, PAY_ESCROW_SIGNATURE, OPEN_CASE_PRE_SUCCESS,
  PAY_ESCROW_SIGNATURE_SUCCEEDED, PAY_ESCROW_SIGNATURE_FAILED,
  OPEN_CASE_SIGNATURE, OPEN_CASE_SIGNATURE_SUCCEEDED, OPEN_CASE_SIGNATURE_FAILED,
  SIGNATURE_PAYMENT, SIGNATURE_OPEN_CASE, GET_ARBITRATION_BY_ID_FAILED,
  USER_RATING, USER_RATING_FAILED, USER_RATING_SUCCEEDED, ADD_USER_RATING,
  GET_ESCROW, GET_ESCROW_FAILED, GET_ESCROW_SUCCEEDED, GET_FEE, GET_FEE_SUCCEEDED, GET_FEE_FAILED

} from './constants';
import {getEnsAddress} from "../../services/embarkjs";


export function *createEscrow({user, escrow}) {
  try {
    user.statusContactCode = yield getEnsAddress(user.statusContactCode);
  } catch (error) {
    yield put({type: CREATE_ESCROW_FAILED, error});
    return;
  }
  const toSend = Escrow.methods.create(
    user.buyerAddress,
    escrow.offerId,
    escrow.tradeAmount,
    1,
    escrow.assetPrice,
    user.statusContactCode,
    '',
    user.username);
  yield doTransaction(CREATE_ESCROW_PRE_SUCCESS, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW_FAILED, {user, escrow, toSend});
}

export function *onCreateEscrow() {
  yield takeEvery(CREATE_ESCROW, createEscrow);
}

export function *onReleaseEscrow() {
  yield takeEvery(RELEASE_ESCROW, doTransaction.bind(null, RELEASE_ESCROW_PRE_SUCCESS, RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW_FAILED));
}

export function *onPayEscrow() {
  yield takeEvery(PAY_ESCROW, doTransaction.bind(null, PAY_ESCROW_PRE_SUCCESS, PAY_ESCROW_SUCCEEDED, PAY_ESCROW_FAILED));
}

export function *onFundEscrow() {
  yield takeEvery(FUND_ESCROW, doTransaction.bind(null, FUND_ESCROW_PRE_SUCCESS, FUND_ESCROW_SUCCEEDED, FUND_ESCROW_FAILED));
}

export function *payEscrowSignature({escrowId}) {
  try {
    const messageHash = yield call(Escrow.methods.paySignHash(escrowId).call, {from: web3.eth.defaultAccount});
    const signedMessage = yield call(web3.eth.personal.sign, messageHash, web3.eth.defaultAccount);
    yield put({type: PAY_ESCROW_SIGNATURE_SUCCEEDED, escrowId, signedMessage, signatureType: SIGNATURE_PAYMENT});
  } catch (error) {
    console.error(error);
    yield put({type: PAY_ESCROW_SIGNATURE_FAILED, error: error.message});
  }
}

export function *onPayEscrowSignature() {
  yield takeEvery(PAY_ESCROW_SIGNATURE, payEscrowSignature);
}

export function *openCaseSignature({escrowId}) {
  try {
    const messageHash = yield call(Escrow.methods.openCaseSignHash(escrowId).call, {from: web3.eth.defaultAccount});
    const signedMessage = yield call(web3.eth.personal.sign, messageHash, web3.eth.defaultAccount);
    yield put({type: OPEN_CASE_SIGNATURE_SUCCEEDED, escrowId, signedMessage, signatureType: SIGNATURE_OPEN_CASE});
  } catch (error) {
    console.error(error);
    yield put({type: OPEN_CASE_SIGNATURE_FAILED, error: error.message});
  }
}

export function *onOpenCaseSignature() {
  yield takeEvery(OPEN_CASE_SIGNATURE, openCaseSignature);
}

export function *onOpenCase() {
  yield takeEvery(OPEN_CASE, doTransaction.bind(null, OPEN_CASE_PRE_SUCCESS, OPEN_CASE_SUCCEEDED, OPEN_CASE_FAILED));
}

export function *getArbitrationById({escrowId}) {
  try {
    yield formatEscrows([escrowId]);
    // FIXME adding this breaks sends a second transaction for some reason. SEND HELP
    // const arbitration = escrows[0].arbitration;
    // yield put({type: GET_ARBITRATION_BY_ID_SUCCEEDED, escrowId, arbitration});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ARBITRATION_BY_ID_FAILED, error: error.message});
  }
}

export function *onOpenCaseSuccess() {
  yield takeEvery(OPEN_CASE_SUCCEEDED, getArbitrationById);
}

export function *onCancelEscrow() {
  yield takeEvery(CANCEL_ESCROW, doTransaction.bind(null, CANCEL_ESCROW_PRE_SUCCESS, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW_FAILED));
}

export function *onRateTx() {
  yield takeEvery(RATE_TRANSACTION,  doTransaction.bind(null, RATE_TRANSACTION_PRE_SUCCESS, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_FAILED));
}

function *formatEscrows(escrowIds) {
  const escrows = [];
  for (let i = 0; i < escrowIds.length; i++) {
    const escrow = yield call(Escrow.methods.transactions(escrowIds[i]).call);
    escrow.escrowId = escrowIds[i];
    if(escrow.paid){
      const arbitration = yield call(Escrow.methods.arbitrationCases(escrowIds[i]).call);
      if(arbitration.open){
        escrow.arbitration = arbitration;
      }
    }
    escrows.push(escrow);
  }
  return escrows;
}

export function *doLoadEscrows({address}) {
  try {
    address = address || web3.eth.defaultAccount;

    const eventsAsBuyer = yield Escrow.getPastEvents('Created', {filter: {buyer: address}, fromBlock: 1});
    const eventsAsSeller = yield Escrow.getPastEvents('Created', {filter: {seller: address}, fromBlock: 1});

    const events = eventsAsBuyer.map(x => { x.isBuyer = true; return x; }).concat(eventsAsSeller.map(x => { x.isBuyer = false; return x; }));

    const escrows = yield all(events.map(function *(ev) {
      const escrow = yield Escrow.methods.transactions(ev.returnValues.escrowId).call();
      escrow.escrowId = ev.returnValues.escrowId;
      escrow.offer = yield MetadataStore.methods.offer(escrow.offerId).call();
      const sellerId = yield MetadataStore.methods.addressToUser(escrow.offer.owner).call();
      escrow.seller = yield MetadataStore.methods.users(sellerId).call();
      const buyerId = yield MetadataStore.methods.addressToUser(escrow.buyer).call();
      escrow.buyerInfo = yield MetadataStore.methods.users(buyerId).call();
      return escrow;
    }));

    yield put({type: LOAD_ESCROWS_SUCCEEDED, escrows: escrows});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_ESCROWS_FAILED, error: error.message});
  }
}

export function *doGetEscrow({escrowId}) {
  try {
    const escrow = yield Escrow.methods.transactions(escrowId).call();
    escrow.escrowId = escrowId;
    escrow.offer = yield MetadataStore.methods.offer(escrow.offerId).call();
    const sellerId = yield MetadataStore.methods.addressToUser(escrow.offer.owner).call();
    escrow.seller = yield MetadataStore.methods.users(sellerId).call();
    const buyerId = yield MetadataStore.methods.addressToUser(escrow.buyer).call();
    escrow.buyerInfo = yield MetadataStore.methods.users(buyerId).call();
    yield put({type: GET_ESCROW_SUCCEEDED, escrow});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ESCROW_FAILED, error: error.message});
  }
}

export function *onLoadEscrows() {
  yield takeEvery(LOAD_ESCROWS, doLoadEscrows);
}

export function *onGetEscrow() {
  yield takeEvery(GET_ESCROW, doGetEscrow);
}

export function *onGetFee() {
  yield takeEvery(GET_FEE, doGetFee);
}

export function *doGetFee(){
  try {
    const fee = yield Escrow.methods.feeAmount().call();
    return yield put({type: GET_FEE_SUCCEEDED, fee});
  } catch (error) {
    console.error(error);
    yield put({type: GET_FEE_FAILED, error: error.message});
  }
}

export function *checkUserRating({address}) {
  try {
    address = address || web3.eth.defaultAccount;
    const state = yield select();
    const offers = Object.values(state.metadata.offers).filter(offer => offer.owner === address.toLowerCase());
    if (!offers.length) {
      return yield put({type: USER_RATING_SUCCEEDED, userRating: -1, address, downCount: 0, upCount: 0, voteCount: 0});
    }

    const allEvents = yield all(offers.map(async (offer) => {
      return Escrow.getPastEvents('Rating', {fromBlock: 1, filter: {offerId: offer.id}});
    }));

    const ratings = [];
    allEvents.forEach(events => {
      events.forEach((e) => {
        ratings.push(parseInt(e.returnValues.rating, 10));
      });
    });
    const downCount = ratings.filter(rating => rating < 3).length;
    const upCount = ratings.filter(rating => rating > 3).length;
    const voteCount = ratings.length;

    yield put({type: USER_RATING_SUCCEEDED, downCount, upCount, voteCount, address});
  } catch (error) {
    console.error(error);
    yield put({type: USER_RATING_FAILED, error: error.message});
  }
}
export function *onUserRating() {
  yield takeEvery(USER_RATING, checkUserRating);
}

export async function *addRating() {
  try {
    // TODO add this back (don't know when this was commented
    //rate_transaction(uint _escrowId, uint _rate)
  } catch (error) {
    console.error(error);
    yield put({type: USER_RATING_FAILED, error: error.message});
  }
}

export function *onAddUserRating() {
  yield takeEvery(ADD_USER_RATING, addRating);
}

export default [
  fork(onCreateEscrow), fork(onLoadEscrows), fork(onGetEscrow), fork(onReleaseEscrow), fork(onCancelEscrow), fork(onUserRating), fork(onAddUserRating),
  fork(onRateTx), fork(onPayEscrow), fork(onPayEscrowSignature), fork(onOpenCase), fork(onOpenCaseSignature), fork(onOpenCaseSuccess),
  fork(onGetFee), fork(onFundEscrow)
];
