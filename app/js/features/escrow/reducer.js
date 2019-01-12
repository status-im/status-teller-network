import {
  CREATE_ESCROW_FAILED,
  CREATE_ESCROW_SUCCEEDED,
  GET_ESCROWS_SUCCEEDED,
  GET_ESCROWS_FAILED,
  GET_ESCROWS,
  RELEASE_ESCROW_SUCCEEDED,
  RELEASE_ESCROW_FAILED,
  CANCEL_ESCROW_FAILED,
  CANCEL_ESCROW_SUCCEEDED,
  RATE_TRANSACTION_FAILED,
  RATE_TRANSACTION_SUCCEEDED,
  PAY_ESCROW_SUCCEEDED,
  PAY_ESCROW_FAILED,
  PAY_ESCROW_SIGNATURE_SUCCEEDED,
  PAY_ESCROW_SIGNATURE_FAILED,
  OPEN_CASE_FAILED,
  OPEN_CASE_SUCCEEDED,
  OPEN_CASE_SIGNATURE_SUCCEEDED,
  OPEN_CASE_SIGNATURE_FAILED,
  CLOSE_DIALOG,
  INCLUDE_SIGNATURE_SUCCEEDED,
  INCLUDE_SIGNATURE_FAILED
} from './constants';
import cloneDeep from 'clone-deep';

const DEFAULT_STATE = {escrows: [], message: null, type: null, escrowId: null};

const escrowBuilder = function (escrowObject) {
  return {
    escrowId: escrowObject.escrowId,
    buyer: escrowObject.buyer,
    seller: escrowObject.seller,
    expirationTime: escrowObject.expirationTime,
    amount: escrowObject.amount,
    released: false,
    canceled: false,
    paid: false,
    rating: 0
  };
};

function reducer(state = DEFAULT_STATE, action) {
  let escrows  = cloneDeep(state.escrows);
  switch (action.type) {
    case CREATE_ESCROW_FAILED:
    case INCLUDE_SIGNATURE_FAILED:
      return {...state, ...{
          error: action.error,
          receipt: null
        }};
    case INCLUDE_SIGNATURE_SUCCEEDED:
    case CREATE_ESCROW_SUCCEEDED:
      escrows.push(escrowBuilder(action.receipt.events.Created.returnValues));
      return {...state, ...{
          escrows: escrows,
          receipt: action.receipt,
          error: ''
        }};
    case GET_ESCROWS:
      return {...state, ...{
        loading: true
      }};
    case GET_ESCROWS_SUCCEEDED:
      return {...state, ...{
          escrows: action.escrows,
          loading: false
        }};
    case RELEASE_ESCROW_FAILED:
    case CANCEL_ESCROW_FAILED:
    case GET_ESCROWS_FAILED:
    case RATE_TRANSACTION_FAILED:
    case PAY_ESCROW_FAILED:
    case OPEN_CASE_FAILED:
    case PAY_ESCROW_SIGNATURE_FAILED:
    case OPEN_CASE_SIGNATURE_FAILED:
      return {...state, ...{
          errorGet: action.error,
          loading: false
        }};
    case PAY_ESCROW_SIGNATURE_SUCCEEDED:
    case OPEN_CASE_SIGNATURE_SUCCEEDED:
      return { ...state, ...{
          message: action.signedMessage,
          type: action.signatureType,
          escrowId: action.escrowId
        }};
    case RELEASE_ESCROW_SUCCEEDED:
      escrows[action.escrowId].released = true;
      return {...state, ...{
          escrows: escrows,
          errorGet: ''
        }};
    case PAY_ESCROW_SUCCEEDED:
      escrows[action.escrowId].paid = true;
      return {...state, ...{
        escrows,
        errorGet: ''
      }};
    case OPEN_CASE_SUCCEEDED:
      return {...state, ...{
        escrows,
        errorGet: ''
      }};
    case CANCEL_ESCROW_SUCCEEDED:
      escrows[action.escrowId].canceled = true;
      return {...state, ...{
          escrows: escrows,
          errorGet: ''
        }};
    case RATE_TRANSACTION_SUCCEEDED:
      escrows[action.escrowId].rating = action.rating;
      return {...state, ...{
          escrows: escrows,
          errorGet: ''
        }};
    case CLOSE_DIALOG: 
      return {...state, ...{
        message: null,
        type: null,
        escrowId: null
      }};
    default:
      return state;
  }
}

export default reducer;
