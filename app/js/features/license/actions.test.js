import * as actions from './actions';
import * as constants from './constants';

describe('actions', () => {
  it('should create an action to buy a license', () => {
    const expectedAction = {
      type: constants.BUY_LICENSE
    };
    expect(actions.buyLicense()).toEqual(expectedAction);
  });
});
