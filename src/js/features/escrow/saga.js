/*global web3*/
import EscrowRelay from '../../../embarkArtifacts/contracts/EscrowRelay';
import EscrowInstance from '../../../embarkArtifacts/contracts/EscrowInstance';
import OfferStoreInstance from '../../../embarkArtifacts/contracts/OfferStoreInstance';
import UserStoreInstance from '../../../embarkArtifacts/contracts/UserStoreInstance';

import {fork, takeEvery, call, put, select, all} from 'redux-saga/effects';
import {doTransaction, contractEvent, doSign} from '../../utils/saga';
import {addressCompare, zeroAddress} from '../../utils/address';
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
  GET_ESCROW, GET_ESCROW_FAILED, GET_ESCROW_SUCCEEDED,
  WATCH_ESCROW, ESCROW_EVENT_RECEIVED, WATCH_ESCROW_CREATIONS, ESCROW_CREATED_EVENT_RECEIVED,
  GET_LAST_ACTIVITY, GET_LAST_ACTIVITY_SUCCEEDED, GET_LAST_ACTIVITY_FAILED,
  GET_FEE_MILLI_PERCENT, GET_FEE_MILLI_PERCENT_FAILED, GET_FEE_MILLI_PERCENT_SUCCEEDED
} from './constants';
import {eventTypes} from './helpers';
import {ADD_OFFER_SUCCEEDED, LOAD_USER} from "../metadata/constants";

const { toBN } = web3.utils;

export function *createEscrow({user, escrow}) {
  const toSend = EscrowInstance.methods.createEscrow(
    escrow.offerId,
    escrow.tokenAmount,
    escrow.currencyQuantity,
    web3.eth.defaultAccount,
    user.contactData,
    '',
    user.username
    );
  yield doTransaction(CREATE_ESCROW_PRE_SUCCESS, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW_FAILED, {user, escrow, toSend});
  yield put({type: LOAD_USER, address: web3.eth.defaultAccount});
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

export function *fundEscrow({value, escrowId, token}) {
  const feeMilliPercent = yield EscrowInstance.methods.feeMilliPercent().call();
  const divider = 100 * (feeMilliPercent / 1000);
  const feeAmount = toBN(value).div(toBN(divider));
  const totalAmount = toBN(value).add(feeAmount);

  const toSend = EscrowInstance.methods.fund(escrowId);

  yield doTransaction(FUND_ESCROW_PRE_SUCCESS, FUND_ESCROW_SUCCEEDED, FUND_ESCROW_FAILED, {
    value: (token !== zeroAddress) ? '0' : totalAmount.toString(),
    escrowId,
    toSend
  });
}

export function *onFundEscrow() {
  yield takeEvery(FUND_ESCROW, fundEscrow);
}

export function *payEscrowSignature({escrowId}) {
  try {
    const messageHash = yield call(EscrowInstance.methods.paySignHash(escrowId).call, {from: web3.eth.defaultAccount});
    const signedMessage = yield doSign(messageHash);
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
    const messageHash = yield call(EscrowInstance.methods.openCaseSignHash(escrowId).call, {from: web3.eth.defaultAccount});
    const signedMessage = yield doSign(messageHash);
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

export function *rate(options) {
  const {escrowId, ratingSeller} = options;
  try {
    const escrow = yield select(state => state.escrow.escrows[escrowId]);
    yield doTransaction(RATE_TRANSACTION_PRE_SUCCESS, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_FAILED, Object.assign({}, options, {user: ratingSeller ? escrow.offer.owner : escrow.buyer}));
  } catch (error) {
    console.error(error);
    yield put({type: RATE_TRANSACTION_FAILED, error: error.message});
  }
}

export function *onRateTx() {
  yield takeEvery(RATE_TRANSACTION, rate);
}

function *formatEscrows(escrowIds) {
  const escrows = [];
  for (let i = 0; i < escrowIds.length; i++) {
    const escrow = yield call(EscrowInstance.methods.transactions(escrowIds[i]).call);
    escrow.escrowId = escrowIds[i];
    if (escrow.paid) {
      const arbitration = yield call(EscrowInstance.methods.arbitrationCases(escrowIds[i]).call);
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
    const defaultAccount = web3.eth.defaultAccount || zeroAddress;
    address = address || web3.eth.defaultAccount;
    if (!address) {
      throw new Error('No address yet. Wallet is not accessible yet');
    }

    const eventsAsBuyer = yield EscrowInstance.getPastEvents('Created', {filter: {buyer: address}, fromBlock: 1});
    const eventsAsSeller = yield EscrowInstance.getPastEvents('Created', {filter: {seller: address}, fromBlock: 1});

    const events = eventsAsBuyer.map(x => {
      x.isBuyer = true;
      return x;
    }).concat(eventsAsSeller.map(x => {
      x.isBuyer = false;
      return x;
    }));

    const escrows = yield all(events.map(function *(ev) {
      const escrow = yield EscrowInstance.methods.transactions(ev.returnValues.escrowId).call({from: defaultAccount});
      escrow.escrowId = ev.returnValues.escrowId;
      escrow.offer = yield OfferStoreInstance.methods.offer(escrow.offerId).call({from: defaultAccount});
      escrow.currency = escrow.offer.currency;
      escrow.margin = escrow.offer.margin;

      let sellerInfo = yield select(state => state.metadata.users[escrow.offer.owner]);
      if(!sellerInfo) {
        sellerInfo = yield UserStoreInstance.methods.users(escrow.offer.owner).call({from: defaultAccount});
      }

      let buyerInfo = yield select(state => state.metadata.users[escrow.buyer]);
      if(!buyerInfo){
        buyerInfo = yield UserStoreInstance.methods.users(escrow.buyer).call({from: defaultAccount});
      }

      let arbitratorInfo = yield select(state => state.metadata.users[escrow.arbitrator]);
      if(!arbitratorInfo){
        arbitratorInfo = yield UserStoreInstance.methods.users(escrow.arbitrator).call({from: defaultAccount});
      }

      escrow.seller = sellerInfo;
      escrow.buyerInfo = buyerInfo;
      escrow.arbitratorInfo = arbitratorInfo;

      return escrow;
    }));

    yield put({type: LOAD_ESCROWS_SUCCEEDED, escrows});
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
    const defaultAccount = web3.eth.defaultAccount || zeroAddress;
    const escrow = yield EscrowInstance.methods.transactions(escrowId).call({from: defaultAccount});
    escrow.escrowId = escrowId;
    escrow.offer = yield OfferStoreInstance.methods.offer(escrow.offerId).call({from: defaultAccount});
    escrow.seller = yield UserStoreInstance.methods.users(escrow.offer.owner).call({from: defaultAccount});
    escrow.buyerInfo = yield UserStoreInstance.methods.users(escrow.buyer).call({from: defaultAccount});
    escrow.arbitratorInfo = yield UserStoreInstance.methods.users(escrow.arbitrator).call({from: defaultAccount});
    yield put({type: GET_ESCROW_SUCCEEDED, escrow, escrowId});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ESCROW_FAILED, error: error.message});
  }
}

export function *onGetEscrow() {
  yield takeEvery(GET_ESCROW, doGetEscrow);
}
export function *doGetFeeMilliPercent() {
  try {
    const defaultAccount = web3.eth.defaultAccount || zeroAddress;
    const feeMilliPercent = yield EscrowInstance.methods.feeMilliPercent().call({from: defaultAccount});
    yield put({type: GET_FEE_MILLI_PERCENT_SUCCEEDED, feeMilliPercent});
  } catch (error) {
    console.error(error);
    yield put({type: GET_FEE_MILLI_PERCENT_FAILED, error: error.message});
  }
}

export function *onGetFeeMilliPercent() {
  yield takeEvery(GET_FEE_MILLI_PERCENT, doGetFeeMilliPercent);
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

export function *checkUserRating({address}) {
  try {
    address = address || web3.eth.defaultAccount;
    const state = yield select();
    const offers = Object.values(state.metadata.offers).filter(offer => addressCompare(offer.owner, address));
    if (!offers.length) {
      return yield put({type: USER_RATING_SUCCEEDED, userRating: -1, address, downCount: 0, upCount: 0, voteCount: 0});
    }

    const allEvents = yield all(offers.map(async (offer) => {
      return EscrowInstance.getPastEvents('Rating', {fromBlock: 1, filter: {offerId: offer.id}});
    }));

    const ratings = [];
    allEvents.forEach(events => {
      events.forEach((e) => {
        if(e.returnValues.ratingSeller){
          ratings.push(parseInt(e.returnValues.rating, 10));
        }
      });
    });
    let downCount = 0;
    let upCount = 0;
    let average = 0;
    ratings.forEach(rating => {
      average += rating;
      if (rating < 3) {
        downCount++;
      } else if (rating > 3) {
        upCount++;
      }
    });
    const voteCount = ratings.length;
    average /= voteCount;

    yield put({type: USER_RATING_SUCCEEDED, downCount, upCount, voteCount, address, averageCount: average, averageCountBase10: ((average * 10) / 5)});
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
    if (!address) {
      throw new Error('No address given');
    }
    const defaultAccount = web3.eth.defaultAccount || zeroAddress;
    const lastActivity = yield EscrowRelay.methods.lastActivity(address).call({from: defaultAccount});
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
      contractEvent(EscrowInstance, eventTypes.funded, {escrowId}, ESCROW_EVENT_RECEIVED),
      contractEvent(EscrowInstance, eventTypes.paid, {escrowId}, ESCROW_EVENT_RECEIVED),
      contractEvent(EscrowInstance, eventTypes.released, {escrowId}, ESCROW_EVENT_RECEIVED),
      contractEvent(EscrowInstance, eventTypes.canceled, {escrowId}, ESCROW_EVENT_RECEIVED)
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
    yield all(offers.map(offer => contractEvent(EscrowInstance, eventTypes.created, {offerId: offer.id}, ESCROW_CREATED_EVENT_RECEIVED, true)));
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
  fork(onFundEscrow), fork(onWatchEscrow), fork(onWatchEscrowCreations), fork(onGetEscrowAfterEvent),
  fork(onGetLastActivity), fork(onWatchAddOfferSuccess), fork(onGetFeeMilliPercent)
];
