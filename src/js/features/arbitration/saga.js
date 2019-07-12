/* global web3 */
import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import ArbitrationLicense from '../../../embarkArtifacts/contracts/ArbitrationLicense';
import SNT from '../../../embarkArtifacts/contracts/SNT';
import MetadataStore from '../../../embarkArtifacts/contracts/MetadataStore';
import moment from 'moment';
import {promiseEventEmitter, doTransaction} from '../../utils/saga';
import {eventChannel} from "redux-saga";
import {fork, takeEvery, call, put, take, all} from 'redux-saga/effects';
import {addressCompare} from '../../utils/address';
import {
  CLOSED, NONE,
  GET_DISPUTED_ESCROWS, GET_DISPUTED_ESCROWS_FAILED, GET_DISPUTED_ESCROWS_SUCCEEDED,
  RESOLVE_DISPUTE, RESOLVE_DISPUTE_FAILED, RESOLVE_DISPUTE_SUCCEEDED,
  RESOLVE_DISPUTE_PRE_SUCCESS, LOAD_ARBITRATION, LOAD_ARBITRATION_FAILED, LOAD_ARBITRATION_SUCCEEDED, GET_ARBITRATORS,
  GET_ARBITRATORS_SUCCEEDED, GET_ARBITRATORS_FAILED, BUY_LICENSE, BUY_LICENSE_FAILED, BUY_LICENSE_PRE_SUCCESS, BUY_LICENSE_SUCCEEDED,
  LOAD_PRICE, LOAD_PRICE_FAILED, LOAD_PRICE_SUCCEEDED, CHECK_LICENSE_OWNER, CHECK_LICENSE_OWNER_FAILED, CHECK_LICENSE_OWNER_SUCCEEDED,
  OPEN_DISPUTE, OPEN_DISPUTE_SUCCEEDED, OPEN_DISPUTE_FAILED, OPEN_DISPUTE_PRE_SUCCESS, CANCEL_DISPUTE, CANCEL_DISPUTE_PRE_SUCCESS, CANCEL_DISPUTE_SUCCEEDED, CANCEL_DISPUTE_FAILED, REQUEST_ARBITRATOR, REQUEST_ARBITRATOR_PRE_SUCCESS, REQUEST_ARBITRATOR_SUCCEEDED, REQUEST_ARBITRATOR_FAILED, CANCEL_ARBITRATOR_REQUEST, CANCEL_ARBITRATOR_REQUEST_SUCCEEDED, CANCEL_ARBITRATOR_REQUEST_FAILED, CANCEL_ARBITRATOR_REQUEST_PRE_SUCCESS, CHANGE_ACCEPT_EVERYONE, CHANGE_ACCEPT_EVERYONE_PRE_SUCCESS, CHANGE_ACCEPT_EVERYONE_FAILED, CHANGE_ACCEPT_EVERYONE_SUCCEEDED, GET_ARBITRATION_REQUESTS, GET_ARBITRATION_REQUESTS_FAILED, GET_ARBITRATION_REQUESTS_SUCCEEDED, ACCEPT_ARBITRATOR_REQUEST, ACCEPT_ARBITRATOR_REQUEST_PRE_SUCCESS, ACCEPT_ARBITRATOR_REQUEST_SUCCEEDED, ACCEPT_ARBITRATOR_REQUEST_FAILED, REJECT_ARBITRATOR_REQUEST, REJECT_ARBITRATOR_REQUEST_PRE_SUCCESS, REJECT_ARBITRATOR_REQUEST_SUCCEEDED, REJECT_ARBITRATOR_REQUEST_FAILED
} from './constants';
import ArbitrationLicenseProxy from '../../../embarkArtifacts/contracts/ArbitrationLicenseProxy';
import EscrowProxy from '../../../embarkArtifacts/contracts/EscrowProxy';
import MetadataStoreProxy from '../../../embarkArtifacts/contracts/MetadataStoreProxy';

MetadataStore.options.address = MetadataStoreProxy.options.address;
ArbitrationLicense.options.address = ArbitrationLicenseProxy.options.address;
Escrow.options.address = EscrowProxy.options.address;

export function *onResolveDispute() {
  yield takeEvery(RESOLVE_DISPUTE, doTransaction.bind(null, RESOLVE_DISPUTE_PRE_SUCCESS, RESOLVE_DISPUTE_SUCCEEDED, RESOLVE_DISPUTE_FAILED));
}

export function *onOpenDispute() {
  yield takeEvery(OPEN_DISPUTE, doTransaction.bind(null, OPEN_DISPUTE_PRE_SUCCESS, OPEN_DISPUTE_SUCCEEDED, OPEN_DISPUTE_FAILED));
}

export function *onCancelDispute() {
  yield takeEvery(CANCEL_DISPUTE, doTransaction.bind(null, CANCEL_DISPUTE_PRE_SUCCESS, CANCEL_DISPUTE_SUCCEEDED, CANCEL_DISPUTE_FAILED));
}

export function *doGetArbitrators({address, includeAll}) {
  try {
    const cnt = yield call(ArbitrationLicense.methods.getNumLicenseOwners().call);
    const arbitrators = {};
    for(let i = 0; i < cnt; i++){
      const arbitrator = web3.utils.toChecksumAddress(yield call(ArbitrationLicense.methods.licenseOwners(i).call));
      const isAllowed = yield call(ArbitrationLicense.methods.isAllowed(address, arbitrator).call);
      if(isAllowed || includeAll) {
        const id = web3.utils.soliditySha3(arbitrator, address);
        arbitrators[arbitrator] = yield call(ArbitrationLicense.methods.arbitratorlicenseDetails(arbitrator).call);
        arbitrators[arbitrator].isAllowed = isAllowed;
        arbitrators[arbitrator].request = yield call(ArbitrationLicense.methods.requests(id).call);
      }
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

export function *onGetArbitratorApprovalRequests() {
  yield takeEvery(GET_ARBITRATION_REQUESTS, doGetArbitratorApprovalRequests);
}

export function *doGetArbitratorApprovalRequests({address}) {
  try {
    const events = yield ArbitrationLicense.getPastEvents('ArbitratorRequested', {fromBlock: 1, filter: {arbitrator: address} });
    const requests = yield all(events.map(function *(event) {
      const request = event.returnValues;
      const requestDetail = yield ArbitrationLicense.methods.requests(request.id).call();

      if([NONE, CLOSED].indexOf(requestDetail.status) > -1 || !addressCompare(requestDetail.arbitrator,address)) return null;

      request.status = requestDetail.status;
      return request;
    }));

    yield put({type: GET_ARBITRATION_REQUESTS_SUCCEEDED, requests: requests.filter(x => x !== null)});

  } catch (error) {
    console.error(error);
    yield put({type: GET_ARBITRATION_REQUESTS_FAILED, error: error.message});
  }

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
    const licenseDetails = yield call(ArbitrationLicense.methods.arbitratorlicenseDetails(web3.eth.defaultAccount).call);
    yield put({type: CHECK_LICENSE_OWNER_SUCCEEDED, isLicenseOwner, acceptAny: licenseDetails.acceptAny});
  } catch (error) {
    console.error(error);
    yield put({type: CHECK_LICENSE_OWNER_FAILED, error: error.message});
  }
}

export function *onCheckLicenseOwner() {
  yield takeEvery(CHECK_LICENSE_OWNER, doCheckLicenseOwner);
}

export function *onRequestArbitrator() {
  yield takeEvery(REQUEST_ARBITRATOR, doTransaction.bind(null, REQUEST_ARBITRATOR_PRE_SUCCESS, REQUEST_ARBITRATOR_SUCCEEDED, REQUEST_ARBITRATOR_FAILED));
}

export function *doCancelArbitratorRequest({arbitrator}){
  const id = web3.utils.soliditySha3(arbitrator, web3.eth.defaultAccount);
  const toSend = ArbitrationLicense.methods.cancelRequest(id);
  yield doTransaction(CANCEL_ARBITRATOR_REQUEST_PRE_SUCCESS, CANCEL_ARBITRATOR_REQUEST_SUCCEEDED, CANCEL_ARBITRATOR_REQUEST_FAILED, {
    arbitrator,
    toSend
  });
}

export function *onCancelArbitratorRequest() {
  yield takeEvery(CANCEL_ARBITRATOR_REQUEST, doCancelArbitratorRequest);
}

export function *onChangeAcceptAll() {
  yield takeEvery(CHANGE_ACCEPT_EVERYONE, doTransaction.bind(null, CHANGE_ACCEPT_EVERYONE_PRE_SUCCESS, CHANGE_ACCEPT_EVERYONE_SUCCEEDED, CHANGE_ACCEPT_EVERYONE_FAILED));
}

export function *onAcceptRequest() {
  yield takeEvery(ACCEPT_ARBITRATOR_REQUEST, doTransaction.bind(null, ACCEPT_ARBITRATOR_REQUEST_PRE_SUCCESS, ACCEPT_ARBITRATOR_REQUEST_SUCCEEDED, ACCEPT_ARBITRATOR_REQUEST_FAILED));
}

export function *onRejectRequest() {
  yield takeEvery(REJECT_ARBITRATOR_REQUEST, doTransaction.bind(null, REJECT_ARBITRATOR_REQUEST_PRE_SUCCESS, REJECT_ARBITRATOR_REQUEST_SUCCEEDED, REJECT_ARBITRATOR_REQUEST_FAILED));
}

export default [
  fork(onGetEscrows),
  fork(onResolveDispute),
  fork(onLoadArbitration),
  fork(onGetArbitrators),
  fork(onBuyLicense),
  fork(onCheckLicenseOwner),
  fork(onLoadPrice),
  fork(onOpenDispute),
  fork(onCancelDispute),
  fork(onRequestArbitrator),
  fork(onCancelArbitratorRequest),
  fork(onChangeAcceptAll),
  fork(onGetArbitratorApprovalRequests),
  fork(onAcceptRequest),
  fork(onRejectRequest)
];
