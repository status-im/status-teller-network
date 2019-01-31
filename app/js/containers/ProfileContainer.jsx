import React, { Component, Fragment } from 'react';
import ProfileInformation from '../components/ProfileInformation';
import Reputation from '../components/Reputation';
import Trades from '../components/Trades';
import Offers from '../components/Offers';
import StatusContractCode from '../components/StatusContractCode';

class ProfileContainer extends Component {
  render() {
    return (
      <Fragment>
        <ProfileInformation />
        <Reputation />
        <Trades trades={[{address: 'address', name: 'Name', value: '2', status: 'open'}]}/>
        <Offers offers={
          [
            {
              from: 'ETH',
              to: 'EUR',
              type: 'Selling',
              location: 'Berlin',
              paymentMethod: 'Credit Card',
              rate: '1.5% above Bitfinex'
            }
          ]
        } />
        <StatusContractCode />
      </Fragment>
    );
  }
}

ProfileContainer.propTypes = {
};

export default ProfileContainer;
