import {
  CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW,
  LOAD_ESCROWS_SUCCEEDED,
  GET_ESCROW_SUCCEEDED,
  GET_FEE_SUCCEEDED,
  FUND_ESCROW_FAILED, FUND_ESCROW_SUCCEEDED, FUND_ESCROW, FUND_ESCROW_PRE_SUCCESS,
  RESET_STATUS,
  RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW, RELEASE_ESCROW_FAILED, RELEASE_ESCROW_PRE_SUCCESS,
  PAY_ESCROW, PAY_ESCROW_SUCCEEDED, PAY_ESCROW_FAILED, PAY_ESCROW_PRE_SUCCESS,
  CANCEL_ESCROW, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW_FAILED, CANCEL_ESCROW_PRE_SUCCESS,
  RATE_TRANSACTION, RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_PRE_SUCCESS
} from './constants';
import { States } from '../../utils/transaction';
import { escrowStatus } from './helpers';
import {RESET_STATE} from "../network/constants";

const DEFAULT_STATE = {
  createEscrowStatus: States.none,
  fundEscrowStatus: States.none,
  releaseStatus: States.none,
  payStatus: States.none,
  cancelStatus: States.none,
  rateStatus: States.none,
  escrows: [],
  fee: '0'
};

// eslint-disable-next-line complexity
function reducer(state = DEFAULT_STATE, action) {
  let escrowIdInArray = -1;
  let escrowsClone = [...state.escrows];
  if (action.escrowId) {
    escrowIdInArray = state.escrows.findIndex(escrow => escrow.escrowId === action.escrowId);
    if (escrowIdInArray > -1) {
      escrowsClone[escrowIdInArray] = {
        ...state.escrows[escrowIdInArray],
        mining: false,
        txHash: ''
      };
    }
  }

  switch (action.type) {
    case FUND_ESCROW:
      return {
        ...state,
        fundEscrowStatus: States.pending
      };
    case FUND_ESCROW_FAILED:
      return {
        ...state,
        fundEscrowStatus: States.failed,
        escrows: escrowsClone
      };
    case FUND_ESCROW_SUCCEEDED:
      escrowsClone[escrowIdInArray].status = escrowStatus.FUNDED;
      return {
        ...state,
        fundEscrowStatus: States.success,
        escrows: escrowsClone
      };
    case PAY_ESCROW_PRE_SUCCESS:
    case CANCEL_ESCROW_PRE_SUCCESS:
    case RATE_TRANSACTION_PRE_SUCCESS:
    case RELEASE_ESCROW_PRE_SUCCESS:
    case FUND_ESCROW_PRE_SUCCESS: {
      const newEscrows = [...state.escrows];
      newEscrows[escrowIdInArray] = {
        ...state.escrows[escrowIdInArray],
        mining: true,
        txHash: action.txHash
      };
      return {
        ...state,
        escrows: newEscrows
      };
    }
    case RELEASE_ESCROW:
      return {
        ...state,
        releaseStatus: States.pending
      };
    case RELEASE_ESCROW_SUCCEEDED:
      escrowsClone[escrowIdInArray].status = escrowStatus.RELEASED;
      return {
        ...state,
        releaseStatus: States.success,
        escrows: escrowsClone
      };
    case RELEASE_ESCROW_FAILED:
      return {
        ...state,
        releaseStatus: States.failed,
        escrows: escrowsClone
      };
    case PAY_ESCROW:
      return {
        ...state,
        payStatus: States.pending
      };
    case PAY_ESCROW_SUCCEEDED:
      escrowsClone[escrowIdInArray].status = escrowStatus.PAID;
      return {
        ...state,
        payStatus: States.success,
        escrows: escrowsClone
      };
    case PAY_ESCROW_FAILED:
      return {
        ...state,
        payStatus: States.failed
      };
    case CREATE_ESCROW:
      return {
        ...state,
        createEscrowStatus: States.pending
      };
    case CREATE_ESCROW_FAILED:
      return {
        ...state,
        createEscrowStatus: States.failed,
        escrows: escrowsClone
      };
    case CREATE_ESCROW_SUCCEEDED:
      return {
        ...state,
        createEscrowId: action.receipt.events.Created.returnValues.escrowId,
        createEscrowStatus: States.success,
        escrows: escrowsClone
      };
    case GET_ESCROW_SUCCEEDED:
      if (!escrowIdInArray) {
        escrowIdInArray = escrowsClone.length;
      }
      escrowsClone[escrowIdInArray] = action.escrow;
      return {
        ...state,
        escrows: escrowsClone
      };
    case LOAD_ESCROWS_SUCCEEDED:
      return {
        ...state,
        escrows: action.escrows
      };
    case GET_FEE_SUCCEEDED:
      return {
        ...state,
        fee: action.fee
      };
    case CANCEL_ESCROW:
      return {
        ...state,
        cancelStatus: States.pending
      };
    case CANCEL_ESCROW_SUCCEEDED:
      {

        escrowsClone[escrowIdInArray].status = escrowStatus.CANCELED;
        return {
          ...state,
          escrows: escrowsClone,
          cancelStatus: States.success
        };
      }
    case CANCEL_ESCROW_FAILED:
      return {
        ...state,
        cancelStatus: States.failed,
        escrows: escrowsClone
      };
    case RATE_TRANSACTION:
      return {
        ...state,
        rateStatus: States.pending
      };
    case RATE_TRANSACTION_SUCCEEDED: {
      return {
        ...state,
        rateStatus: States.success,
        escrows: escrowsClone
      };
    }
    case RATE_TRANSACTION_FAILED:
      return {
        ...state,
        rateStatus: States.failed,
        escrows: escrowsClone
      };
    case RESET_STATUS:
      return {
        ...state,
        fundEscrowStatus: States.none,
        createEscrowStatus: States.none,
        payStatus: States.none,
        releaseStatus: States.none,
        rateStatus: States.none
      };
    case RESET_STATE: {
      return DEFAULT_STATE;
    }
    default:
      return state;
  }
}

export default reducer;
