import {
  CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW,
  RESET_CREATE_ESCROW_STATUS,
  GET_ESCROWS_SUCCEEDED, GET_ESCROWS_FAILED, GET_ESCROWS,
  RELEASE_ESCROW, RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW_FAILED, RELEASE_ESCROW_PRE_SUCCESS,
  CANCEL_ESCROW_FAILED, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW, CANCEL_ESCROW_PRE_SUCCESS,
  RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION, RATE_TRANSACTION_PRE_SUCCESS,
  PAY_ESCROW_SUCCEEDED, PAY_ESCROW_FAILED, PAY_ESCROW_SIGNATURE_SUCCEEDED, PAY_ESCROW_SIGNATURE_FAILED, PAY_ESCROW, PAY_ESCROW_PRE_SUCCESS,
  OPEN_CASE_FAILED, OPEN_CASE_SUCCEEDED, OPEN_CASE_SIGNATURE_SUCCEEDED, OPEN_CASE_SIGNATURE_FAILED, OPEN_CASE, OPEN_CASE_PRE_SUCCESS,
  CLOSE_DIALOG, GET_ARBITRATION_BY_ID_SUCCEEDED, GET_ARBITRATION_BY_ID_FAILED
} from './constants';
import cloneDeep from 'clone-deep';
import { States } from '../../utils/transaction';

const DEFAULT_STATE = {
  createEscrowStatus: States.none,
  escrows: [],
  message: null,
  type: null,
  escrowId: null,
  loading: false,
  error: '',
  txHash: '',
  txHashList: '',
  loadingList: false
};

const escrowBuilder = function(rawEscrow) {
  return {
    escrowId: rawEscrow.escrowId,
    buyer: rawEscrow.buyer,
    seller: rawEscrow.seller,
    expirationTime: rawEscrow.expirationTime,
    amount: rawEscrow.amount,
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
    case RESET_CREATE_ESCROW_STATUS:
      return {
        ...state,
        createEscrowStatus: States.none
      };
    case CREATE_ESCROW:
      return {
        ...state, 
        createEscrowStatus: States.pending
      };
    case CREATE_ESCROW_FAILED:
      return {
        ...state,
        createEscrowStatus: States.error
      };
    case CREATE_ESCROW_SUCCEEDED:
      escrows.push(escrowBuilder(action.receipt.events.Created.returnValues));
      return {
        ...state,
        createEscrowStatus: States.success,
        escrows: escrows
      };
    case GET_ESCROWS:
      return {
        ...state, ...{
          loadingList: true
        }
      };
    case GET_ESCROWS_SUCCEEDED:
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
    case GET_ARBITRATION_BY_ID_FAILED:
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
    case CANCEL_ESCROW_PRE_SUCCESS:
    case RATE_TRANSACTION_PRE_SUCCESS:
    case OPEN_CASE_PRE_SUCCESS:
    case PAY_ESCROW_PRE_SUCCESS:
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
          errorGet: '',
          loadingList: false
        }
      };
    case GET_ARBITRATION_BY_ID_SUCCEEDED:
      currentEscrow.arbitration = action.arbitration;
      return {
        ...state, ...{
          escrows
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
