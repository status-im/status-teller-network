/*global web3*/
import {
  CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED, CREATE_ESCROW, CREATE_ESCROW_PRE_SUCCESS,
  LOAD_ESCROWS_SUCCEEDED,
  GET_ESCROW_SUCCEEDED,
  FUND_ESCROW_FAILED, FUND_ESCROW_SUCCEEDED, FUND_ESCROW, FUND_ESCROW_PRE_SUCCESS,
  RESET_STATUS,
  RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW, RELEASE_ESCROW_FAILED, RELEASE_ESCROW_PRE_SUCCESS,
  PAY_ESCROW, PAY_ESCROW_SUCCEEDED, PAY_ESCROW_FAILED, PAY_ESCROW_PRE_SUCCESS,
  CANCEL_ESCROW, CANCEL_ESCROW_SUCCEEDED, CANCEL_ESCROW_FAILED, CANCEL_ESCROW_PRE_SUCCESS,
  RATE_TRANSACTION, RATE_TRANSACTION_FAILED, RATE_TRANSACTION_SUCCEEDED, RATE_TRANSACTION_PRE_SUCCESS,
  ESCROW_EVENT_RECEIVED, ESCROW_CREATED_EVENT_RECEIVED, CLEAR_NEW_ESCROW, CLEAR_CHANGED_ESCROW,
  GET_LAST_ACTIVITY_SUCCEEDED, RESET_CREATE_STATUS, GET_FEE_MILLI_PERCENT_FAILED, GET_FEE_MILLI_PERCENT_SUCCEEDED
} from './constants';
import { States } from '../../utils/transaction';
import {escrowStatus, eventTypes} from './helpers';
import {RESET_STATE, PURGE_STATE} from "../network/constants";
import merge from 'merge';
import {toChecksumAddress} from "../../utils/address";

const FIVE_DAYS = 86400 * 5;

const DEFAULT_STATE = {
  escrows: {},
  createEscrowStatus: States.none,
  lastActivity: 0,
  newEscrow: null,
  changedEscrow: null,
  feeMilliPercent: null,
  feeMilliPercentError: null
};

function isActionNeeded(escrows) {
  if(!web3.eth.defaultAccount) return false;
  
  const defaultAccount = toChecksumAddress(web3.eth.defaultAccount);
  // Check the trade status to see if there are actions needed
  const actionNeeded = Object.values(escrows).find(trade => {
    const isBuyer = defaultAccount === toChecksumAddress(trade.buyer);
    if (!isBuyer && defaultAccount !== toChecksumAddress(trade.offer.owner)) {
      // not buyer nor seller
      return false;
    }
    switch (trade.status) {
      case escrowStatus.CREATED: return !isBuyer;
      case escrowStatus.FUNDED: return isBuyer;
      case escrowStatus.PAID: return !isBuyer;
      default: return false;
    }
  });
  return !!actionNeeded;
}

// eslint-disable-next-line complexity
function reducer(state = DEFAULT_STATE, action) {
  const escrowId = action.escrowId;
  let escrowsClone = {...state.escrows};
  if (action.escrowId) {
    escrowsClone[action.escrowId] = {
      ...escrowsClone[action.escrowId],
      mining: false,
      txHash: ''
    };
  }

  switch (action.type) {
    case FUND_ESCROW:
      escrowsClone[escrowId].fundStatus = States.pending;
      return {
        ...state,
        escrows: escrowsClone,
        txHash: '-'
      };
    case FUND_ESCROW_FAILED:
      escrowsClone[escrowId].fundStatus = States.failed;
      return {
        ...state,
        escrows: escrowsClone
      };
    case FUND_ESCROW_SUCCEEDED:
      escrowsClone[escrowId].fundStatus = States.success;
      escrowsClone[escrowId].expirationTime = (Date.now() / 1000) + FIVE_DAYS;
      escrowsClone[escrowId].status = escrowStatus.FUNDED;
      return {
        ...state,
        escrows: escrowsClone,
        actionNeeded: isActionNeeded(escrowsClone)
      };
    case PAY_ESCROW_PRE_SUCCESS:
    case CANCEL_ESCROW_PRE_SUCCESS:
    case RATE_TRANSACTION_PRE_SUCCESS:
    case RELEASE_ESCROW_PRE_SUCCESS:
    case FUND_ESCROW_PRE_SUCCESS: {
      escrowsClone[escrowId] = {
        ...state.escrows[escrowId],
        mining: true,
        txHash: action.txHash
      };
      return {
        ...state,
        escrows: escrowsClone
      };
    }
    case RELEASE_ESCROW:
      escrowsClone[escrowId].releaseStatus = States.pending;
      return {
        ...state,
        escrows: escrowsClone
      };
    case RELEASE_ESCROW_SUCCEEDED:
      escrowsClone[escrowId].releaseStatus = States.success;
      escrowsClone[escrowId].status = escrowStatus.RELEASED;
      return {
        ...state,
        escrows: escrowsClone,
        actionNeeded: isActionNeeded(escrowsClone)
      };
    case RELEASE_ESCROW_FAILED:
      escrowsClone[escrowId].releaseStatus = States.failed;
      return {
        ...state,
        escrows: escrowsClone
      };
    case PAY_ESCROW:
      escrowsClone[escrowId].payStatus = States.pending;
      return {
        ...state,
        escrows: escrowsClone
      };
    case PAY_ESCROW_SUCCEEDED:
      escrowsClone[escrowId].payStatus = States.success;
      escrowsClone[escrowId].status = escrowStatus.PAID;
      return {
        ...state,
        escrows: escrowsClone,
        actionNeeded: isActionNeeded(escrowsClone)
      };
    case PAY_ESCROW_FAILED:
      escrowsClone[escrowId].payStatus = States.failed;
      return {
        ...state,
        escrows: escrowsClone
      };
    case CREATE_ESCROW:
      return {
        ...state,
        createEscrowStatus: States.pending,
        txHash: ''
      };
    case CREATE_ESCROW_FAILED:
      return {
        ...state,
        createEscrowStatus: States.failed,
        escrows: escrowsClone,
        txHash: ''
      };
    case CREATE_ESCROW_PRE_SUCCESS:
      return {
        ...state,
          txHash: action.txHash
      };
    case CREATE_ESCROW_SUCCEEDED:
      return {
        ...state,
        createEscrowId: action.receipt.events.Created.returnValues.escrowId,
        createEscrowStatus: States.success,
        txHash: ''
      };
    case GET_ESCROW_SUCCEEDED:
      if (state.escrows[escrowId]) {
        escrowsClone[escrowId] = merge.recursive(action.escrow, state.escrows[escrowId]);
      } else {
        escrowsClone[escrowId] = action.escrow;
      }
      return {
        ...state,
        escrows: escrowsClone
      };
    case LOAD_ESCROWS_SUCCEEDED: {
      if (Array.isArray(action.escrows)) {
        action.escrows = action.escrows.reduce((total, escrow) => {
          total[escrow.escrowId] = escrow;
          return total;
        }, {});
      }
      const escrows = merge.recursive(state.escrows, action.escrows);
      return {
        ...state,
        escrows: escrows,
        actionNeeded: isActionNeeded(escrows)
      };
    }
    case GET_LAST_ACTIVITY_SUCCEEDED:
      return {
        ...state,
        lastActivity: (parseInt(action.lastActivity, 10) * 1000)
      };
    case CANCEL_ESCROW:
      escrowsClone[escrowId].cancelStatus = States.pending;
      return {
        ...state,
        escrows: escrowsClone
      };
    case CANCEL_ESCROW_SUCCEEDED: {
      escrowsClone[escrowId].cancelStatus = States.success;
      escrowsClone[escrowId].status = escrowStatus.CANCELED;
      return {
        ...state,
        escrows: escrowsClone,
        actionNeeded: isActionNeeded(escrowsClone)
      };
    }
    case CANCEL_ESCROW_FAILED:
      escrowsClone[escrowId].cancelStatus = States.failed;
      return {
        ...state,
        escrows: escrowsClone
      };
    case RATE_TRANSACTION:
      escrowsClone[action.escrowId] = {
        ...escrowsClone[action.escrowId]
      };

      escrowsClone[action.escrowId].rateLoading = true;
      if(action.ratingSeller){
        escrowsClone[action.escrowId].rateSellerStatus = States.pending;
        escrowsClone[action.escrowId].sellerRating = action.rating;
      } else {
        escrowsClone[action.escrowId].rateBuyerStatus = States.pending;
        escrowsClone[action.escrowId].buyerRating = action.rating;
      }

      return {
        ...state,
        escrows: escrowsClone
      };
    case RATE_TRANSACTION_SUCCEEDED: {
      escrowsClone[action.escrowId] = {
        ...escrowsClone[action.escrowId]
      };

      escrowsClone[action.escrowId].rateLoading = false;
      if(action.ratingSeller){
        escrowsClone[action.escrowId].rateSellerStatus = States.success;
        escrowsClone[action.escrowId].sellerRating = action.rating;
      } else {
        escrowsClone[action.escrowId].rateBuyerStatus = States.success;
        escrowsClone[action.escrowId].buyerRating = action.rating;
      }

      return {
        ...state,
        escrows: escrowsClone
      };
    }
    case RATE_TRANSACTION_FAILED:
      escrowsClone[action.escrowId] = {
        ...escrowsClone[action.escrowId]
      };

      escrowsClone[action.escrowId].rateLoading = false;
      if(action.ratingSeller){
        escrowsClone[action.escrowId].rateSellerStatus = States.failed;
        escrowsClone[action.escrowId].sellerRating = 0;
      } else {
        escrowsClone[action.escrowId].rateBuyerStatus = States.failed;
        escrowsClone[action.escrowId].buyerRating = 0;
      }

      return {
        ...state,
        escrows: escrowsClone
      };
    case ESCROW_EVENT_RECEIVED:
      if (action.result.event === eventTypes.funded) {
        escrowsClone[escrowId].expirationTime = action.result.returnValues.expirationTime;
        escrowsClone[escrowId].status = escrowStatus.FUNDED;
      }
      if (action.result.event === eventTypes.paid) {
        escrowsClone[escrowId].status = escrowStatus.PAID;
      }
      if (action.result.event === eventTypes.released) {
        escrowsClone[escrowId].status = escrowStatus.RELEASED;
      }
      if (action.result.event === eventTypes.canceled) {
        escrowsClone[escrowId].status = escrowStatus.CANCELED;
      }
      return {
        ...state,
        escrows: escrowsClone,
        changedEscrow: {escrowId, status: escrowsClone[escrowId].status}
      };
    case ESCROW_CREATED_EVENT_RECEIVED:
      return {
        ...state,
        newEscrow: action.result.returnValues.escrowId
      };
    case GET_FEE_MILLI_PERCENT_SUCCEEDED:
      return {
        ...state,
        feeMilliPercent: action.feeMilliPercent,
        feeMilliPercentError: null
      };
    case GET_FEE_MILLI_PERCENT_FAILED:
      return {
        ...state,
        feeMilliPercent: null,
        feeMilliPercentError: action.error
      };
    case CLEAR_NEW_ESCROW:
      return {
        ...state,
        newEscrow: null
      };
    case CLEAR_CHANGED_ESCROW:
      return {
        ...state,
        changedEscrow: null
      };
    case RESET_CREATE_STATUS:
      return {
        ...state,
        createEscrowStatus: States.none
      };
    case RESET_STATUS:
      escrowsClone[escrowId] = {
        ...escrowsClone[escrowId],
        fundStatus: States.none,
        createEscrowStatus: States.none,
        payStatus: States.none,
        releaseStatus: States.none,
        rateStatus: States.none,
        cancelStatus: States.none
      };
      return {
        ...state,
        escrows: escrowsClone
      };
    case PURGE_STATE:
    case RESET_STATE: {
      return DEFAULT_STATE;
    }
    default:
      return state;
  }
}

export default reducer;
