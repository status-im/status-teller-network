import reducer from './reducer';
import * as constants from './constants';

describe('reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        licenseOwner: false,
        userRating: 0,
        price: Number.MAX_SAFE_INTEGER
      }
    );
  });

  it('should handle BUY_LICENSE_SUCCEEDED', () => {
    expect(
      reducer({}, {
        type: constants.BUY_LICENSE_SUCCEEDED
      })
    ).toEqual(
      {
        licenseOwner: true,
        loading: false
      }
    );
  });
});
