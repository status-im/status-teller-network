import Escrow from 'Embark/contracts/Escrow';
import MetadataStore from 'Embark/contracts/MetadataStore';

import {fork, takeEvery, call, put} from 'redux-saga/effects';
import {
  GET_DISPUTED_ESCROWS, GET_DISPUTED_ESCROWS_FAILED, GET_DISPUTED_ESCROWS_SUCCEEDED,
  RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED, RESOLVE_DISPUTE_SUCCEEDED,
  RESOLVE_DISPUTE_PRE_SUCCESS
} from './constants';
import {doTransaction} from "../../utils/saga";

export function *onResolveDispute() {
  yield takeEvery(RESOLVE_DISPUTE, doTransaction.bind(null, RESOLVE_DISPUTE_PRE_SUCCESS, RESOLVE_DISPUTE_SUCCEEDED, RESOLVE_DISPUTE_FAILED));
}

export function *doGetEscrows() {
  try {
    const events = yield Escrow.getPastEvents('ArbitrationRequired', {fromBlock: 1});
    const escrowIds = events.map(event => {
      return event.returnValues.escrowId;
    });

    const escrows = [];
    for (let i = 0; i < escrowIds.length; i++) {
      const escrow = yield call(Escrow.methods.transactions(escrowIds[i]).call);
      const buyerId = yield MetadataStore.methods.addressToUser(escrow.buyer).call();
      const buyer = yield MetadataStore.methods.users(buyerId).call();
      const offer = yield MetadataStore.methods.offers(escrow.offerId).call();
      const sellerId = yield MetadataStore.methods.addressToUser(offer.owner).call();
      const seller = yield MetadataStore.methods.users(sellerId).call();
      
      escrow.escrowId = escrowIds[i];
      escrow.seller = offer.owner;
      escrow.buyerInfo = buyer;
      escrow.sellerInfo = seller;
      escrow.arbitration = yield call(Escrow.methods.arbitrationCases(escrowIds[i]).call);
      escrows.push(escrow);
    }

    yield put({type: GET_DISPUTED_ESCROWS_SUCCEEDED, escrows});
  } catch (error) {
    console.error(error);
    yield put({type: GET_DISPUTED_ESCROWS_FAILED, error: error.message});
  }
}

export function *onGetEscrows() {
  yield takeEvery(GET_DISPUTED_ESCROWS, doGetEscrows);
}

export default [fork(onGetEscrows), fork(onResolveDispute)];
