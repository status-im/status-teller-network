import {
  CHECK_EMAIL_SUBSCRIPTION_SUCCESS, CHECK_EMAIL_SUBSCRIPTION_FAILURE,
  SUBSCRIBE_EMAIL, SUBSCRIBE_EMAIL_SUCCESS, SUBSCRIBE_EMAIL_FAILURE, HIDE_ERROR,
  VERIFY_EMAIL, VERIFY_EMAIL_FAILURE, VERIFY_EMAIL_SUCCESS, HIDE_SUCCESS,
  UNSUBSCRIBE_EMAIL, UNSUBSCRIBE_EMAIL_FAILURE, UNSUBSCRIBE_EMAIL_SUCCESS,
  SET_REDIRECT_TARGET, REFUSE_EMAIL_NOTIFICATIONS
} from './constants';
import {RESET_STATE, PURGE_STATE} from '../network/constants';

const DEFAULT_STATE = {
  isSubscribed: null,
  email: '',
  verifySuccess: null,
  subscribeSuccess: null,
  redirectTarget: null,
  refusedEmailNotifications: false
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case CHECK_EMAIL_SUBSCRIPTION_SUCCESS:
      return {
        ...state, ...{
          isSubscribed: action.subscribed
        }
      };
    case SET_REDIRECT_TARGET:
      return {
        ...state, ...{
          redirectTarget: action.redirectTarget
        }
      };
    case VERIFY_EMAIL:
    case SUBSCRIBE_EMAIL:
    case UNSUBSCRIBE_EMAIL:
      return {
        ...state, ...{
          working: true
        }
      };
    case SUBSCRIBE_EMAIL_SUCCESS:
      return {
        ...state, ...{
          working: false,
          email: action.email,
          error: '',
          subscribeSuccess: true
        }
      };
    case VERIFY_EMAIL_SUCCESS:
      return {
        ...state, ...{
          isSubscribed: true,
          working: false,
          error: '',
          verifySuccess: true
        }
      };
    case UNSUBSCRIBE_EMAIL_SUCCESS:
      return {
        ...state, ...{
          isSubscribed: false,
          working: false,
          error: ''
        }
      };
    case VERIFY_EMAIL_FAILURE:
    case CHECK_EMAIL_SUBSCRIPTION_FAILURE:
    case SUBSCRIBE_EMAIL_FAILURE:
    case UNSUBSCRIBE_EMAIL_FAILURE:
      return {
        ...state, ...{
          error: action.error,
          working: false
        }
      };
    case HIDE_ERROR:
      return {
        ...state, ...{
          error: ''
        }
      };
    case HIDE_SUCCESS:
      return {
        ...state, ...{
          verifySuccess: null,
          subscribeSuccess: null
        }
      };
    case REFUSE_EMAIL_NOTIFICATIONS:
      return {
        ...state, ...{
          refusedEmailNotifications: true
        }
      };
    case RESET_STATE:
    case PURGE_STATE:
      return DEFAULT_STATE;
    default:
      return state;
  }
}

export default reducer;
