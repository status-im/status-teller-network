import React, { Component } from 'react';
import SellerInformation from '../../components/SellerInformation';
import Trades from '../../components/Trades';
import Offers from '../../components/Offers';
import Map from '../../components/Buyer/Map';
import StatusContractCode from '../../components/StatusContractCode';
import PropTypes from 'prop-types';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.address = this.props.match.params.address;
    // TODO get seller information
  }
  render() {
    return (
      <div className="seller-profile">
        <SellerInformation name="Roger" isPositiveRating={true} nbTrades={32} type="Collectibles" address={this.address} />
        <Map coords={{latitude: 45.492611, longitude: -73.617959}} markerOnly={true}/>
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
      </div>
    );
  }
}

ProfileContainer.propTypes = {
  match: PropTypes.object
};

export default ProfileContainer;
