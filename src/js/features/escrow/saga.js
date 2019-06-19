/*global web3*/
import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import MetadataStore from '../../../embarkArtifacts/contracts/MetadataStore';

import {fork, takeEvery, call, put, select, all} from 'redux-saga/effects';
import {doTransaction, contractEvent} from '../../utils/saga';
import {addressCompare} from '../../utils/address';
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
  GET_ESCROW, GET_ESCROW_FAILED, GET_ESCROW_SUCCEEDED, GET_FEE, GET_FEE_SUCCEEDED, GET_FEE_FAILED,
  WATCH_ESCROW, ESCROW_EVENT_RECEIVED, WATCH_ESCROW_CREATIONS, ESCROW_CREATED_EVENT_RECEIVED, GET_LAST_ACTIVITY, GET_LAST_ACTIVITY_SUCCEEDED, GET_LAST_ACTIVITY_FAILED
} from './constants';
import {eventTypes} from './helpers';
import {ADD_OFFER_SUCCEEDED} from "../metadata/constants";

export function *createEscrow({user, escrow}) {
  const toSend = Escrow.methods.create(
    user.signature,
    escrow.offerId,
    escrow.tradeAmount,
    1,
    escrow.assetPrice,
    user.statusContactCode,
    '',
    user.username,
    user.nonce
    );
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
  yield takeEvery(RATE_TRANSACTION, doTransaction.bind(null, RATE_TRANSACTION_PRE_SUCCESS, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_FAILED));
}

function *formatEscrows(escrowIds) {
  const escrows = [];
  for (let i = 0; i < escrowIds.length; i++) {
    const escrow = yield call(Escrow.methods.transactions(escrowIds[i]).call);
    escrow.escrowId = escrowIds[i];
    if (escrow.paid) {
      const arbitration = yield call(Escrow.methods.arbitrationCases(escrowIds[i]).call);
      if (arbitration.open) {
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

    const events = eventsAsBuyer.map(x => {
      x.isBuyer = true;
      return x;
    }).concat(eventsAsSeller.map(x => {
      x.isBuyer = false;
      return x;
    }));

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

export function *onLoadEscrows() {
  yield takeEvery(LOAD_ESCROWS, doLoadEscrows);
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
    yield put({type: GET_ESCROW_SUCCEEDED, escrow, escrowId});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ESCROW_FAILED, error: error.message});
  }
}

export function *onGetEscrow() {
  yield takeEvery(GET_ESCROW, doGetEscrow);
}

export function *doGetEscrowByEvent({result}) {
  try {
    yield doGetEscrow({escrowId: result.returnValues.escrowId});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ESCROW_FAILED, error: error.message});
  }
}

export function *onGetEscrowAfterEvent() {
  yield takeEvery(ESCROW_CREATED_EVENT_RECEIVED, doGetEscrowByEvent);
}

export function *onGetFee() {
  yield takeEvery(GET_FEE, doGetFee);
}

export function *doGetFee() {
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
    const offers = Object.values(state.metadata.offers).filter(offer => addressCompare(offer.owner, address));
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

export function *doGetLastActivity({address}){
  try {
    const lastActivity = yield Escrow.methods.lastActivity(address).call();
    return yield put({type: GET_LAST_ACTIVITY_SUCCEEDED, lastActivity});
  } catch (error) {
    console.error(error);
    yield put({type: GET_LAST_ACTIVITY_FAILED, error: error.message});
  }
}

export function *onGetLastActivity() {
  yield takeEvery(GET_LAST_ACTIVITY, doGetLastActivity);
}

export function *watchEscrow({escrowId}) {
  try {
    yield all([
      contractEvent(Escrow, eventTypes.funded, {escrowId}, ESCROW_EVENT_RECEIVED),
      contractEvent(Escrow, eventTypes.paid, {escrowId}, ESCROW_EVENT_RECEIVED),
      contractEvent(Escrow, eventTypes.released, {escrowId}, ESCROW_EVENT_RECEIVED),
      contractEvent(Escrow, eventTypes.canceled, {escrowId}, ESCROW_EVENT_RECEIVED)
    ]);
  } catch (error) {
    console.error(error);
  }
}

export function *onWatchEscrow() {
  yield takeEvery(WATCH_ESCROW, watchEscrow);
}

export function *watchEscrowCreations({offers}) {
  try {
    yield all(offers.map(offer => contractEvent(Escrow, eventTypes.created, {offerId: offer.id}, ESCROW_CREATED_EVENT_RECEIVED, true)));
  } catch (error) {
    console.error(error);
  }
}

export function *onWatchEscrowCreations() {
  yield takeEvery(WATCH_ESCROW_CREATIONS, watchEscrowCreations);
}

export function *watchNewOffer({offer, receipt}) {
  try {
    const newOffer = Object.assign({}, offer, {id: receipt.events.OfferAdded.returnValues.offerId});
    yield put({type: WATCH_ESCROW_CREATIONS, offers: [newOffer]});
  } catch (error) {
    console.error(error);
  }
}

export function *onWatchAddOfferSuccess() {
  yield takeEvery(ADD_OFFER_SUCCEEDED, watchNewOffer);
}

export default [
  fork(onCreateEscrow), fork(onLoadEscrows), fork(onGetEscrow), fork(onReleaseEscrow), fork(onCancelEscrow), fork(onUserRating), fork(onAddUserRating),
  fork(onRateTx), fork(onPayEscrow), fork(onPayEscrowSignature), fork(onOpenCase), fork(onOpenCaseSignature), fork(onOpenCaseSuccess),
  fork(onGetFee), fork(onFundEscrow), fork(onWatchEscrow), fork(onWatchEscrowCreations), fork(onGetEscrowAfterEvent), fork(onGetLastActivity), fork(onWatchAddOfferSuccess)
];
