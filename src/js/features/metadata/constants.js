// Action
export const LOAD = 'METADATA/LOAD';
export const LOAD_USER = 'METADATA/LOAD_USER';
export const LOAD_USER_SUCCEEDED = 'METADATA/LOAD_USER/SUCCEEDED';
export const LOAD_USER_FAILED = 'METADATA/LOAD_USER/FAILED';
export const LOAD_OFFERS = 'METADATA/LOAD_OFFERS';
export const LOAD_OFFERS_SUCCEEDED = 'METADATA/LOAD_OFFERS/SUCCEEDED';
export const LOAD_OFFERS_FAILED = 'METADATA/LOAD_OFFERS/FAILED';
export const LOAD_USER_LOCATION = 'METADATA/LOAD_USER_LOCATION';
export const LOAD_USER_LOCATION_SUCCEEDED = 'METADATA/LOAD_USER_LOCATION/SUCCEEDED';
export const LOAD_USER_TRADE_NUMBER_SUCCEEDED = 'METADATA/LOAD_USER_TRADE_NUMBER/SUCCEEDED';

export const SET_CURRENT_USER = 'METADATA/SET_CURRENT_USER';

export const RESET_ADD_OFFER_STATUS = 'METADATA/RESET_ADD_OFFER_STATUS';
export const RESET_NEW_OFFER = 'METADATA/RESET_NEW_OFFER';
export const ADD_OFFER = 'METADATA/ADD_OFFER';
export const ADD_OFFER_SUCCEEDED = 'METADATA/ADD_OFFER/SUCCEEDED';
export const ADD_OFFER_FAILED = 'METADATA/ADD_OFFER/FAILED';
export const ADD_OFFER_PRE_SUCCESS = 'METADATA/ADD_OFFER/PRE_SUCCESS';

export const RESET_UPDATE_USER_STATUS = 'METADATA/RESET_UPDATE_USER_STATUS';
export const UPDATE_USER = 'METADATA/UPDATE_USER';
export const UPDATE_USER_SUCCEEDED = 'METADATA/UPDATE_USER/SUCCEEDED';
export const UPDATE_USER_FAILED = 'METADATA/UPDATE_USER/FAILED';
export const UPDATE_USER_PRE_SUCCESS = 'METADATA/UPDATE_USER/PRE_SUCCESS';

export const SIGN_MESSAGE = 'METADATA/SIGN_MESSAGE';
export const SIGN_MESSAGE_SUCCEEDED = 'METADATA/SIGN_MESSAGE_SUCCEEDED';
export const SIGN_MESSAGE_FAILED = 'METADATA/SIGN_MESSAGE_FAILED';

export const DELETE_OFFER = 'METADATA/DELETE_OFFER';
export const DELETE_OFFER_PRE_SUCCESS = 'METADATA/DELETE_OFFER_PRE_SUCCESS';
export const DELETE_OFFER_SUCCEEDED = 'METADATA/DELETE_OFFER_SUCCEEDED';
export const DELETE_OFFER_FAILED = 'METADATA/DELETE_OFFER_FAILED';

// Mapping
export const POPULAR_PAYMENT_METHODS_INDEXES = [1, 2, 3];

export const PAYMENT_METHODS = {
    1:  'Bank transfer',
    2:  'Cash (in person)',
    3:  'Cash (deposit)',
    4:  'AdvCash',
    5:  'Alfa cash-in',
    6:  'Alipay',
    7:  'Cardless cash',
    8:  'Efecty',
    9:  'Gift card',
    10: 'IMPS',
    11: 'Interac e-Transfer',
    12: 'International wire',
    13: 'M-PESA',
    14: 'Mercado Pago',
    15: 'MoneyGram',
    16: 'PAYEER',
    17: 'PayNow',
    18: 'PayPal',
    19: 'PayTM',
    20: 'Pingit',
    21: 'QIWI',
    22: 'SEPA transfer',
    23: 'Skrill',
    24: 'Swish',
    25: 'TransferWise',
    26: 'UPI',
    27: 'Venmo',
    28: 'WebMoney',
    29: 'WeChat Pay',
    30: 'Western Union',
    31: 'Yandex.Money',
    99999: 'Other'
};

export const SORT_TYPES = ['Top rated', 'Most recent'];
