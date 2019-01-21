import {
  CREATE_ESCROW_FAILED, CREATE_ESCROW_PRE_SUCCESS, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW,
  GET_ESCROWS_SUCCEEDED, GET_ESCROWS_FAILED, GET_ESCROWS,
  RELEASE_ESCROW, RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW_FAILED, RELEASE_ESCROW_PRE_SUCCESS,
  CANCEL_ESCROW_FAILED, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW,
  RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION,
  PAY_ESCROW_SUCCEEDED, PAY_ESCROW_FAILED, PAY_ESCROW_SIGNATURE_SUCCEEDED, PAY_ESCROW_SIGNATURE_FAILED, PAY_ESCROW,
  OPEN_CASE_FAILED, OPEN_CASE_SUCCEEDED, OPEN_CASE_SIGNATURE_SUCCEEDED, OPEN_CASE_SIGNATURE_FAILED, OPEN_CASE,
  CLOSE_DIALOG
} from './constants';
import cloneDeep from 'clone-deep';

const DEFAULT_STATE = {
  escrows: [], message: null, type: null, escrowId: null, loading: false, error: '', txHash: '',
  txHashList: '', loadingList: false
};

const escrowBuilder = function(escrowObject) {
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

// eslint-disable-next-line complexity
function reducer(state = DEFAULT_STATE, action) {
  let escrows = cloneDeep(state.escrows);
  let currentEscrow;
  if (action.escrowId) {
    currentEscrow = escrows.find(escrow => escrow.escrowId === action.escrowId);
  }

  switch (action.type) {
    case CREATE_ESCROW:
      return {
        ...state, ...{
          error: '',
          receipt: null,
          loading: true,
          txHash: ''
        }
      };
    case CREATE_ESCROW_PRE_SUCCESS:
      return {
        ...state, ...{
          txHash: action.txHash
        }
      };
    case CREATE_ESCROW_FAILED:
      return {
        ...state, ...{
          error: action.error,
          receipt: null,
          loading: false,
          txHash: ''
        }
      };
    case CREATE_ESCROW_SUCCEEDED:
      escrows.push(escrowBuilder(action.receipt.events.Created.returnValues));
      return {
        ...state, ...{
          escrows: escrows,
          receipt: action.receipt,
          error: '',
          loading: false
        }
      };
    case GET_ESCROWS:
      return {
        ...state, ...{
          loadingList: true
        }
      };
    case GET_ESCROWS_SUCCEEDED:
      console.log('Got escrows', action);
      return {
        ...state, ...{
          escrows: action.escrows,
          loadingList: false
        }
      };
    case RELEASE_ESCROW_FAILED:
    case CANCEL_ESCROW_FAILED:
    case GET_ESCROWS_FAILED:
    case RATE_TRANSACTION_FAILED:
    case PAY_ESCROW_FAILED:
    case OPEN_CASE_FAILED:
    case PAY_ESCROW_SIGNATURE_FAILED:
    case OPEN_CASE_SIGNATURE_FAILED:
      return {
        ...state, ...{
          errorGet: action.error,
          loadingList: false,
          txHashList: ''
        }
      };
    case PAY_ESCROW_SIGNATURE_SUCCEEDED:
    case OPEN_CASE_SIGNATURE_SUCCEEDED:
      return {
        ...state, ...{
          message: action.signedMessage,
          type: action.signatureType,
          escrowId: action.escrowId,
          loadingList: false
        }
      };
    case RELEASE_ESCROW_PRE_SUCCESS:
      return {
        ...state, ...{
          txHashList: action.txHash
        }
      };
    case CANCEL_ESCROW:
    case RELEASE_ESCROW:
    case RATE_TRANSACTION:
    case PAY_ESCROW:
    case OPEN_CASE:
      return {
        ...state, ...{
          txHashList: '',
          errorGet: '',
          loadingList: true
        }
      };
    case RELEASE_ESCROW_SUCCEEDED:
      currentEscrow.released = true;
      return {
        ...state, ...{
          escrows: escrows,
          errorGet: '',
          loadingList: false
        }
      };
    case PAY_ESCROW_SUCCEEDED:
      currentEscrow.paid = true;
      return {
        ...state, ...{
          escrows,
          errorGet: '',
          loadingList: false
        }
      };
    case OPEN_CASE_SUCCEEDED:
      return {
        ...state, ...{
          escrows,
          errorGet: '',
          loadingList: false
        }
      };
    case CANCEL_ESCROW_SUCCEEDED:
      currentEscrow.canceled = true;
      return {
        ...state, ...{
          escrows: escrows,
          errorGet: '',
          loadingList: false
        }
      };
    case RATE_TRANSACTION_SUCCEEDED:
      currentEscrow.rating = action.rating;
      return {
        ...state, ...{
          escrows: escrows,
          errorGet: '',
          loadingList: false
        }
      };
    case CLOSE_DIALOG:
      return {
        ...state, ...{
          message: null,
          type: null,
          escrowId: null
        }
      };
    default:
      return state;
  }
}

export default reducer;
