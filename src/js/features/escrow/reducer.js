import {
  CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW,
  LOAD_ESCROWS_SUCCEEDED,
  GET_ESCROW_SUCCEEDED,
  GET_FEE_SUCCEEDED,
  FUND_ESCROW_FAILED, FUND_ESCROW_SUCCEEDED, FUND_ESCROW,
  RESET_STATUS,
  RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW, RELEASE_ESCROW_FAILED,
  PAY_ESCROW, PAY_ESCROW_SUCCEEDED, PAY_ESCROW_FAILED,
  CANCEL_ESCROW, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW_FAILED,
  RATE_TRANSACTION, RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED
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
  switch (action.type) {
    case FUND_ESCROW:
      return {
        ...state,
        fundEscrowStatus: States.pending
      };
    case FUND_ESCROW_FAILED:
      return {
        ...state,
        fundEscrowStatus: States.failed
      };
    case FUND_ESCROW_SUCCEEDED:
      return {
        ...state,
        escrow: {
          ...state.escrow,
          status: escrowStatus.FUNDED
        },
        fundEscrowStatus: States.success
      };
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
        releaseStatus: States.success
      };
    case RELEASE_ESCROW_FAILED:
      return {
        ...state,
        releaseStatus: States.failed
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
        payStatus: States.success
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
        createEscrowStatus: States.failed
      };
    case CREATE_ESCROW_SUCCEEDED:
      return {
        ...state,
        createEscrowId: action.receipt.events.Created.returnValues.escrowId,
        createEscrowStatus: States.success
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
        const escrows = state.escrows;
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
        cancelStatus: States.failed
      };
    case RATE_TRANSACTION:
      return {
        ...state,
        rateStatus: States.pending
      };
    case RATE_TRANSACTION_SUCCEEDED: {
      return {
        ...state,
        rateStatus: States.success
      };
    }
    case RATE_TRANSACTION_FAILED:
      return {
        ...state,
        rateStatus: States.failed
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
    // Migrate to new UI
    // case RELEASE_ESCROW_FAILED:
    // case CANCEL_ESCROW_FAILED:
    // case GET_ESCROWS_FAILED:
    // case RATE_TRANSACTION_FAILED:
    // case PAY_ESCROW_FAILED:
    // case OPEN_CASE_FAILED:
    // case PAY_ESCROW_SIGNATURE_FAILED:
    // case OPEN_CASE_SIGNATURE_FAILED:
    // case GET_ARBITRATION_BY_ID_FAILED:
    //   return {
    //     ...state, ...{
    //       errorGet: action.error,
    //       loadingList: false,
    //       txHashList: ''
    //     }
    //   };
    // case PAY_ESCROW_SIGNATURE_SUCCEEDED:
    // case OPEN_CASE_SIGNATURE_SUCCEEDED:
    //   return {
    //     ...state, ...{
    //       message: action.signedMessage,
    //       type: action.signatureType,
    //       escrowId: action.escrowId,
    //       loadingList: false
    //     }
    //   };
    // case RELEASE_ESCROW_PRE_SUCCESS:
    // case CANCEL_ESCROW_PRE_SUCCESS:
    // case RATE_TRANSACTION_PRE_SUCCESS:
    // case OPEN_CASE_PRE_SUCCESS:
    // case PAY_ESCROW_PRE_SUCCESS:
    //   return {
    //     ...state, ...{
    //       txHashList: action.txHash
    //     }
    //   };
    // case CANCEL_ESCROW:
    // case RELEASE_ESCROW:
    // case RATE_TRANSACTION:
    // case PAY_ESCROW:
    // case OPEN_CASE:
    //   return {
    //     ...state, ...{
    //       txHashList: '',
    //       errorGet: '',
    //       loadingList: true
    //     }
    //   };
    // case RELEASE_ESCROW_SUCCEEDED:
    //   currentEscrow.released = true;
    //   return {
    //     ...state, ...{
    //       escrows: escrows,
    //       errorGet: '',
    //       loadingList: false
    //     }
    //   };
    // case PAY_ESCROW_SUCCEEDED:
    //   currentEscrow.paid = true;
    //   return {
    //     ...state, ...{
    //       escrows,
    //       errorGet: '',
    //       loadingList: false
    //     }
    //   };
    // case OPEN_CASE_SUCCEEDED:
    //   return {
    //     ...state, ...{
    //       errorGet: '',
    //       loadingList: false
    //     }
    //   };
    // case GET_ARBITRATION_BY_ID_SUCCEEDED:
    //   currentEscrow.arbitration = action.arbitration;
    //   return {
    //     ...state, ...{
    //       escrows
    //     }
    //   };
    // case CANCEL_ESCROW_SUCCEEDED:
    //   currentEscrow.canceled = true;
    //   return {
    //     ...state, ...{
    //       escrows: escrows,
    //       errorGet: '',
    //       loadingList: false
    //     }
    //   };
    // case RATE_TRANSACTION_SUCCEEDED:
    //   currentEscrow.rating = action.rating;
    //   return {
    //     ...state, ...{
    //       escrows: escrows,
    //       errorGet: '',
    //       loadingList: false
    //     }
    //   };
    // case CLOSE_DIALOG:
    //   return {
    //     ...state, ...{
    //       message: null,
    //       type: null,
    //       escrowId: null
    //     }
    //   };
    default:
      return state;
  }
}

export default reducer;
