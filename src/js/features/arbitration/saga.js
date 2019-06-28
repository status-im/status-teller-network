/* global web3 */
import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import ArbitrationLicense from '../../../embarkArtifacts/contracts/ArbitrationLicense';
import SNT from '../../../embarkArtifacts/contracts/SNT';
import MetadataStore from '../../../embarkArtifacts/contracts/MetadataStore';
import moment from 'moment';
import {promiseEventEmitter, doTransaction} from '../../utils/saga';
import {eventChannel} from "redux-saga";
import {fork, takeEvery, call, put, take} from 'redux-saga/effects';
import {
  GET_DISPUTED_ESCROWS, GET_DISPUTED_ESCROWS_FAILED, GET_DISPUTED_ESCROWS_SUCCEEDED,
  RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED, RESOLVE_DISPUTE_SUCCEEDED,
  RESOLVE_DISPUTE_PRE_SUCCESS, LOAD_ARBITRATION, LOAD_ARBITRATION_FAILED, LOAD_ARBITRATION_SUCCEEDED, GET_ARBITRATORS,
  GET_ARBITRATORS_SUCCEEDED, GET_ARBITRATORS_FAILED, BUY_LICENSE, BUY_LICENSE_FAILED, BUY_LICENSE_PRE_SUCCESS, BUY_LICENSE_SUCCEEDED,
  LOAD_PRICE, LOAD_PRICE_FAILED, LOAD_PRICE_SUCCEEDED, CHECK_LICENSE_OWNER, CHECK_LICENSE_OWNER_FAILED, CHECK_LICENSE_OWNER_SUCCEEDED,
  OPEN_DISPUTE, OPEN_DISPUTE_SUCCEEDED, OPEN_DISPUTE_FAILED, OPEN_DISPUTE_PRE_SUCCESS, CANCEL_DISPUTE, CANCEL_DISPUTE_PRE_SUCCESS, CANCEL_DISPUTE_SUCCEEDED, CANCEL_DISPUTE_FAILED
} from './constants';
import OwnedUpgradeabilityProxy from '../../../embarkArtifacts/contracts/OwnedUpgradeabilityProxy';
Escrow.options.address = OwnedUpgradeabilityProxy.options.address;

export function *onResolveDispute() {
  yield takeEvery(RESOLVE_DISPUTE, doTransaction.bind(null, RESOLVE_DISPUTE_PRE_SUCCESS, RESOLVE_DISPUTE_SUCCEEDED, RESOLVE_DISPUTE_FAILED));
}

export function *onOpenDispute() {
  yield takeEvery(OPEN_DISPUTE, doTransaction.bind(null, OPEN_DISPUTE_PRE_SUCCESS, OPEN_DISPUTE_SUCCEEDED, OPEN_DISPUTE_FAILED));
}

export function *onCancelDispute() {
  yield takeEvery(CANCEL_DISPUTE, doTransaction.bind(null, CANCEL_DISPUTE_PRE_SUCCESS, CANCEL_DISPUTE_SUCCEEDED, CANCEL_DISPUTE_FAILED));
}

export function *doGetArbitrators() {
  try {
    const cnt = yield call(ArbitrationLicense.methods.getNumLicenseOwners().call);
    const arbitrators = [];
    for(let i = 0; i < cnt; i++){
      arbitrators.push(yield call(ArbitrationLicense.methods.licenseOwners(i).call));
    }
    yield put({type: GET_ARBITRATORS_SUCCEEDED, arbitrators});
  } catch (error) {
    console.error(error);
    yield put({type: GET_ARBITRATORS_FAILED, error: error.message});
  }
}

export function *doGetEscrows() {
  try {
    const events = yield Escrow.getPastEvents('ArbitrationRequired', {fromBlock: 1});

    let escrows = [];
    for (let i = 0; i < events.length; i++) {
      const escrowId = events[i].returnValues.escrowId;
      const block = yield web3.eth.getBlock(events[0].blockNumber);
      const escrow = yield call(Escrow.methods.transactions(escrowId).call);
      const offer = yield MetadataStore.methods.offers(escrow.offerId).call();

      escrow.escrowId = escrowId;
      escrow.seller = offer.owner;
      escrow.arbitration = yield call(Escrow.methods.arbitrationCases(escrowId).call);
      escrow.arbitration.createDate = moment(block.timestamp * 1000).format("DD.MM.YY");

      if(escrow.arbitration.open || escrow.arbitration.result !== 0) {
        escrows.push(escrow);
      }
    }

    // remove duplicates in the case of re-opened disputes
    escrows = escrows.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj['escrowId']).indexOf(obj['escrowId']) === pos;
    });

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
    const offer = yield MetadataStore.methods.offers(escrow.offerId).call();

    const events = yield Escrow.getPastEvents('Created', {fromBlock: 1, filter: {escrowId: escrowId} });
    const block = yield web3.eth.getBlock(events[0].blockNumber);
    escrow.createDate = moment(block.timestamp * 1000).format("DD.MM.YY");
    escrow.escrowId = escrowId;
    escrow.seller = offer.owner;
    escrow.offer = offer;
    escrow.arbitration = yield call(Escrow.methods.arbitrationCases(escrowId).call);

    yield put({type: LOAD_ARBITRATION_SUCCEEDED, escrow});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_ARBITRATION_FAILED, error: error.message});
  }
}

export function *onLoadArbitration() {
  yield takeEvery(LOAD_ARBITRATION, doLoadArbitration);
}


export function *doBuyLicense() {
  try {
    const price = yield call(ArbitrationLicense.methods.price().call);
    const encodedCall = ArbitrationLicense.methods.buy().encodeABI();
    const toSend = SNT.methods.approveAndCall(ArbitrationLicense.options.address, price, encodedCall);
    const estimatedGas = yield call(toSend.estimateGas);
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 2000});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: BUY_LICENSE_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        yield put({type: BUY_LICENSE_SUCCEEDED});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(error);
    yield put({type: BUY_LICENSE_FAILED, error: error.message});
  }
}

export function *onBuyLicense() {
  yield takeEvery(BUY_LICENSE, doBuyLicense);
}

export function *loadPrice() {
  try {
    const price = yield call(ArbitrationLicense.methods.price().call);
    yield put({type: LOAD_PRICE_SUCCEEDED, price});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_PRICE_FAILED, error: error.message});
  }
}

export function *onLoadPrice() {
  yield takeEvery(LOAD_PRICE, loadPrice);
}

export function *doCheckLicenseOwner() {
  try {
    const isLicenseOwner = yield call(ArbitrationLicense.methods.isLicenseOwner(web3.eth.defaultAccount).call);
    yield put({type: CHECK_LICENSE_OWNER_SUCCEEDED, isLicenseOwner});
  } catch (error) {
    console.error(error);
    yield put({type: CHECK_LICENSE_OWNER_FAILED, error: error.message});
  }
}

export function *onCheckLicenseOwner() {
  yield takeEvery(CHECK_LICENSE_OWNER, doCheckLicenseOwner);
}

export default [fork(onGetEscrows), fork(onResolveDispute), fork(onLoadArbitration), fork(onGetArbitrators), fork(onBuyLicense), fork(onCheckLicenseOwner), fork(onLoadPrice), fork(onOpenDispute), fork(onCancelDispute)];
