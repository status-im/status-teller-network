import { fork, takeEvery, call, put } from 'redux-saga/effects';
import { 
  EMBARKJS_INIT, EMBARKJS_INIT_FAILED, EMBARKJS_INIT_SUCCEEDED
} from './constants';
import { onReady } from '../../services/embarkjs';

export function *doInit() {
  try {
    yield call(onReady);
    yield put({type: EMBARKJS_INIT_SUCCEEDED});
  } catch (error) {
    yield put({type: EMBARKJS_INIT_FAILED, error});
  }
}

export function *onInit() {
  yield takeEvery(EMBARKJS_INIT, doInit);
}

export default [fork(onInit)];
