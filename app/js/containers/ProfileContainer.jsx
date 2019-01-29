import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
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
        <Offers />
        <StatusContractCode />
      </Fragment>
    );
  }
}

ProfileContainer.propTypes = {
};

export default ProfileContainer;
