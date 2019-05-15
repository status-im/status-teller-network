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

  //Migrate to new UI
  message: null,
  type: null,
  escrowId: null,
  escrow: null,
  loading: false,
  error: '',
  txHash: '',
  txHashList: '',
  loadingList: false,
  fee: '0'
};

// eslint-disable-next-line complexity
function reducer(state = DEFAULT_STATE, action) {
  let escrowIdInArray = -1;
  let miningFalseEscrowsObject = [...state.escrows];
  if (action.escrowId) {
    escrowIdInArray = state.escrows.findIndex(escrow => escrow.escrowId === action.escrowId);
    miningFalseEscrowsObject[escrowIdInArray] = {
      ...state.escrows[escrowIdInArray],
      mining: false
    };
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
        escrows: miningFalseEscrowsObject
      };
    case FUND_ESCROW_SUCCEEDED:
      return {
        ...state,
        escrow: {
          ...state.escrow,
          status: escrowStatus.FUNDED
        },
        fundEscrowStatus: States.success,
        escrows: {
          ...state.escrows,
          [escrowIdInArray]: {
            ...state.escrows[escrowIdInArray],
            mining: false
          }
        }
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
      return {
        ...state,
        escrow: {
          ...state.escrow,
          status: escrowStatus.RELEASED
        },
        releaseStatus: States.success,
        escrows: miningFalseEscrowsObject
      };
    case RELEASE_ESCROW_FAILED:
      return {
        ...state,
        releaseStatus: States.failed,
        escrows: miningFalseEscrowsObject
      };
    case PAY_ESCROW:
      return {
        ...state,
        payStatus: States.pending
      };
    case PAY_ESCROW_SUCCEEDED:
      return {
        ...state,
        escrow: {
          ...state.escrow,
          status: escrowStatus.PAID
        },
        payStatus: States.success,
        escrows: miningFalseEscrowsObject
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
        escrows: miningFalseEscrowsObject
      };
    case CREATE_ESCROW_SUCCEEDED:
      return {
        ...state,
        createEscrowId: action.receipt.events.Created.returnValues.escrowId,
        createEscrowStatus: States.success,
        escrows: miningFalseEscrowsObject
      };
    case GET_ESCROW_SUCCEEDED:
      return {
        ...state,
        escrow: action.escrow
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
        const escrows = miningFalseEscrowsObject;
        escrows.find(x => x.escrowId === action.escrowId).status = escrowStatus.CANCELED;
        return {
          ...state,
          escrows,
          escrow: {
            ...state.escrow,
            status: escrowStatus.CANCELED
          },
          cancelStatus: States.success
        };
      }
    case CANCEL_ESCROW_FAILED:
      return {
        ...state,
        cancelStatus: States.failed,
        escrows: miningFalseEscrowsObject
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
        escrows: miningFalseEscrowsObject
      };
    }
    case RATE_TRANSACTION_FAILED:
      return {
        ...state,
        rateStatus: States.failed,
        escrows: miningFalseEscrowsObject
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
