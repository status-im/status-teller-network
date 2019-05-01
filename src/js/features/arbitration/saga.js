import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import Arbitration from '../../../embarkArtifacts/contracts/Arbitration';
import MetadataStore from '../../../embarkArtifacts/contracts/MetadataStore';
import moment from 'moment';

import {fork, takeEvery, call, put} from 'redux-saga/effects';
import {
  GET_DISPUTED_ESCROWS, GET_DISPUTED_ESCROWS_FAILED, GET_DISPUTED_ESCROWS_SUCCEEDED,
  RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED, RESOLVE_DISPUTE_SUCCEEDED,
  RESOLVE_DISPUTE_PRE_SUCCESS, LOAD_ARBITRATION, LOAD_ARBITRATION_FAILED, LOAD_ARBITRATION_SUCCEEDED, GET_ARBITRATORS, 
  GET_ARBITRATORS_SUCCEEDED, GET_ARBITRATORS_FAILED, OPEN_DISPUTE, OPEN_DISPUTE_SUCCEEDED, OPEN_DISPUTE_FAILED, OPEN_DISPUTE_PRE_SUCCESS
} from './constants';
import {doTransaction} from "../../utils/saga";

export function *onResolveDispute() {
  yield takeEvery(RESOLVE_DISPUTE, doTransaction.bind(null, RESOLVE_DISPUTE_PRE_SUCCESS, RESOLVE_DISPUTE_SUCCEEDED, RESOLVE_DISPUTE_FAILED));
}

export function *onOpenDispute() {
  yield takeEvery(OPEN_DISPUTE, doTransaction.bind(null, OPEN_DISPUTE_PRE_SUCCESS, OPEN_DISPUTE_SUCCEEDED, OPEN_DISPUTE_FAILED));
}

export function *doGetArbitrators() {
  try {
    const cnt = yield call(Arbitration.methods.getNumLicenseOwners().call);
    const arbitrators = [];
    for(let i = 0; i < cnt; i++){
      arbitrators.push(yield call(Arbitration.methods.licenseOwners(i).call));
    }
    yield put({type: GET_ARBITRATORS_SUCCEEDED, arbitrators});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ARBITRATORS_FAILED, error: error.message});
  }
}

export function *doGetEscrows() {
  try {
    const events = yield Arbitration.getPastEvents('ArbitrationRequired', {fromBlock: 1});

    const escrows = [];
    for (let i = 0; i < events.length; i++) {
      const escrowId = events[i].returnValues.escrowId;

      const escrow = yield call(Escrow.methods.transactions(escrowId).call);
      const buyerId = yield MetadataStore.methods.addressToUser(escrow.buyer).call();
      const buyer = yield MetadataStore.methods.users(buyerId).call();
      const offer = yield MetadataStore.methods.offers(escrow.offerId).call();
      const sellerId = yield MetadataStore.methods.addressToUser(offer.owner).call();
      const seller = yield MetadataStore.methods.users(sellerId).call();

      escrow.escrowId = escrowId;
      escrow.seller = offer.owner;
      escrow.buyerInfo = buyer;
      escrow.sellerInfo = seller;
      escrow.arbitration = yield call(Arbitration.methods.arbitrationCases(escrowId).call);
      escrow.arbitration.createDate = moment(events[i].returnValues.date * 1000).format("DD.MM.YY");

      escrows.push(escrow);
    }

    yield put({type: GET_DISPUTED_ESCROWS_SUCCEEDED, escrows});
  } catch (error) {
    console.error(error);
    yield put({type: GET_DISPUTED_ESCROWS_FAILED, error: error.message});
  }
}

export function *onGetArbitrators() {
  yield takeEvery(GET_ARBITRATORS, doGetArbitrators);
}

export function *onGetEscrows() {
  yield takeEvery(GET_DISPUTED_ESCROWS, doGetEscrows);
}

export function *doLoadArbitration({escrowId}) {
  try {
    const escrow = yield call(Escrow.methods.transactions(escrowId).call);
    const buyerId = yield MetadataStore.methods.addressToUser(escrow.buyer).call();
    const buyer = yield MetadataStore.methods.users(buyerId).call();
    const offer = yield MetadataStore.methods.offers(escrow.offerId).call();
    const sellerId = yield MetadataStore.methods.addressToUser(offer.owner).call();
    const seller = yield MetadataStore.methods.users(sellerId).call();

    const events = yield Escrow.getPastEvents('Created', {fromBlock: 1, filter: {escrowId: escrowId} });

    escrow.createDate = moment(events[0].returnValues.date * 1000).format("DD.MM.YY");
    escrow.escrowId = escrowId;
    escrow.seller = offer.owner;
    escrow.buyerInfo = buyer;
    escrow.sellerInfo = seller;
    escrow.offer = offer;
    escrow.arbitration = yield call(Arbitration.methods.arbitrationCases(escrowId).call);

    yield put({type: LOAD_ARBITRATION_SUCCEEDED, escrow});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_ARBITRATION_FAILED, error: error.message});
  }
}

export function *onLoadArbitration() {
  yield takeEvery(LOAD_ARBITRATION, doLoadArbitration);
}

export default [fork(onGetEscrows), fork(onResolveDispute), fork(onLoadArbitration), fork(onGetArbitrators), fork(onOpenDispute)];
