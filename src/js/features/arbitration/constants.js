export const GET_DISPUTED_ESCROWS = 'GET_DISPUTED_ESCROWS';
export const GET_DISPUTED_ESCROWS_SUCCEEDED = 'GET_DISPUTED_ESCROWS_SUCCEEDED';
export const GET_DISPUTED_ESCROWS_FAILED = 'GET_DISPUTED_ESCROWS_FAILED';

export const RESOLVE_DISPUTE = 'RESOLVE_DISPUTE';
export const RESOLVE_DISPUTE_PRE_SUCCESS = 'RESOLVE_DISPUTE_PRE_SUCCESS';
export const RESOLVE_DISPUTE_SUCCEEDED = 'RESOLVE_DISPUTE_SUCCEEDED';
export const RESOLVE_DISPUTE_FAILED = 'RESOLVE_DISPUTE_FAILED';

export const OPEN_DISPUTE = 'OPEN_DISPUTE';
export const OPEN_DISPUTE_PRE_SUCCESS = 'OPEN_DISPUTE_PRE_SUCCESS';
export const OPEN_DISPUTE_SUCCEEDED = 'OPEN_DISPUTE_SUCCEEDED';
export const OPEN_DISPUTE_FAILED = 'OPEN_DISPUTE_FAILED';

export const CANCEL_DISPUTE = 'CANCEL_DISPUTE';
export const CANCEL_DISPUTE_PRE_SUCCESS = 'CANCEL_DISPUTE_PRE_SUCCESS';
export const CANCEL_DISPUTE_SUCCEEDED = 'CANCEL_DISPUTE_SUCCEEDED';
export const CANCEL_DISPUTE_FAILED = 'CANCEL_DISPUTE_FAILED';

export const ARBITRATION_UNSOLVED = "0";
export const ARBITRATION_SOLVED_BUYER = "1";
export const ARBITRATION_SOLVED_SELLER = "2";

export const LOAD_ARBITRATION = 'LOAD_ARBITRATION';
export const LOAD_ARBITRATION_SUCCEEDED = 'LOAD_ARBITRATION_SUCCEEDED';
export const LOAD_ARBITRATION_FAILED = 'LOAD_ARBITRATION_FAILED';

export const GET_ARBITRATORS = 'GET_ARBITRATORS';
export const GET_ARBITRATORS_SUCCEEDED = 'GET_ARBITRATORS_SUCCEEDED';
export const GET_ARBITRATORS_FAILED = 'GET_ARBITRATORS_FAILED';

export const BUY_LICENSE = 'BUY_ARB_LICENSE';
export const BUY_LICENSE_PRE_SUCCESS = 'BUY_ARB_LICENSE_PRE_SUCCESS';
export const BUY_LICENSE_SUCCEEDED = 'BUY_ARB_LICENSE_SUCCEEDED';
export const BUY_LICENSE_FAILED = 'BUY_ARB_LICENSE_FAILED';
export const BUY_LICENSE_CANCEL = 'BUY_ARB_LICENSE_CANCEL';

export const LOAD_PRICE = 'ARBITRATION/LOAD_PRICE';
export const LOAD_PRICE_SUCCEEDED = 'ARBITRATION/LOAD_PRICE/SUCCEEDED';
export const LOAD_PRICE_FAILED = 'ARBITRATION/LOAD_PRICE/FAILED';

export const CHECK_LICENSE_OWNER = 'CHECK_ARB_LICENSE_OWNER';
export const CHECK_LICENSE_OWNER_SUCCEEDED = 'CHECK_ARB_LICENSE_OWNER_SUCCEEDED';
export const CHECK_LICENSE_OWNER_FAILED = 'CHECK_ARB_LICENSE_OWNER_FAILED';

export const REQUEST_ARBITRATOR = 'REQUEST_ARBITRATOR';
export const REQUEST_ARBITRATOR_PRE_SUCCESS = 'REQUEST_ARBITRATOR_PRE_SUCCESS';
export const REQUEST_ARBITRATOR_SUCCEEDED = 'REQUEST_ARBITRATOR_SUCCEEDED';
export const REQUEST_ARBITRATOR_FAILED = 'REQUEST_ARBITRATOR_FAILED';

export const CANCEL_ARBITRATOR_REQUEST = 'CANCEL_ARBITRATOR_REQUEST';
export const CANCEL_ARBITRATOR_REQUEST_PRE_SUCCESS = 'CANCEL_ARBITRATOR_REQUEST_PRE_SUCCESS';
export const CANCEL_ARBITRATOR_REQUEST_SUCCEEDED = 'CANCEL_ARBITRATOR_REQUEST_SUCCEEDED';
export const CANCEL_ARBITRATOR_REQUEST_FAILED = 'CANCEL_ARBITRATOR_REQUEST_FAILED';

export const CANCEL_ARBITRATOR_SELECTION_ACTIONS = 'CANCEL_ARBITRATOR_SELECTION_ACTIONS';

export const CHANGE_ACCEPT_EVERYONE = 'CHANGE_ACCEPT_EVERYONE';
export const CHANGE_ACCEPT_EVERYONE_PRE_SUCCESS = 'CHANGE_ACCEPT_EVERYONE_PRE_SUCCESS';
export const CHANGE_ACCEPT_EVERYONE_SUCCEEDED = 'CHANGE_ACCEPT_EVERYONE_SUCCEEDED';
export const CHANGE_ACCEPT_EVERYONE_FAILED = 'CHANGE_ACCEPT_EVERYONE_FAILED';

export const GET_ARBITRATION_REQUESTS = 'GET_ARBITRATION_REQUESTS';
export const GET_ARBITRATION_REQUESTS_SUCCEEDED = 'GET_ARBITRATION_REQUESTS_SUCCEEDED';
export const GET_ARBITRATION_REQUESTS_FAILED = 'GET_ARBITRATION_REQUESTS_FAILED';

export const BLACKLIST_SELLER = 'BLACKLIST_SELLER';
export const BLACKLIST_SELLER_PRE_SUCCESS = 'BLACKLIST_SELLER_PRE_SUCCESS';
export const BLACKLIST_SELLER_SUCCEEDED = 'BLACKLIST_SELLER_SUCCEEDED';
export const BLACKLIST_SELLER_FAILED = 'BLACKLIST_SELLER_FAILED';

export const UNBLACKLIST_SELLER = 'UNBLACKLIST_SELLER';
export const UNBLACKLIST_SELLER_PRE_SUCCESS = 'UNBLACKLIST_SELLER_PRE_SUCCESS';
export const UNBLACKLIST_SELLER_SUCCEEDED = 'UNBLACKLIST_SELLER_SUCCEEDED';
export const UNBLACKLIST_SELLER_FAILED = 'UNBLACKLIST_SELLER_FAILED';

export const GET_BLACKLISTED_SELLERS = 'GET_BLACKLISTED_SELLERS';
export const GET_BLACKLISTED_SELLERS_SUCCEEDED = 'GET_BLACKLISTED_SELLERS_SUCCEEDED';
export const GET_BLACKLISTED_SELLERS_FAILED = 'GET_BLACKLISTED_SELLERS_FAILED';

export const NONE = '0';
export const AWAIT = '1';
export const ACCEPTED = '2';
export const REJECTED = '3';
export const CLOSED = '4';

export const ACCEPT_ARBITRATOR_REQUEST = 'ACCEPT_ARBITRATOR_REQUEST';
export const ACCEPT_ARBITRATOR_REQUEST_PRE_SUCCESS = 'ACCEPT_ARBITRATOR_REQUEST_PRE_SUCCESS';
export const ACCEPT_ARBITRATOR_REQUEST_SUCCEEDED = 'ACCEPT_ARBITRATOR_REQUEST_SUCCEEDED';
export const ACCEPT_ARBITRATOR_REQUEST_FAILED = 'ACCEPT_ARBITRATOR_REQUEST_FAILED';

export const REJECT_ARBITRATOR_REQUEST = 'REJECT_ARBITRATOR_REQUEST';
export const REJECT_ARBITRATOR_REQUEST_PRE_SUCCESS = 'REJECT_ARBITRATOR_REQUEST_PRE_SUCCESS';
export const REJECT_ARBITRATOR_REQUEST_SUCCEEDED = 'REJECT_ARBITRATOR_REQUEST_SUCCEEDED';
export const REJECT_ARBITRATOR_REQUEST_FAILED = 'REJECT_ARBITRATOR_REQUEST_FAILED';

// motives:
export const UNRESPONSIVE = '1';
export const PAYMENT = '2';
export const OTHER = '3';
