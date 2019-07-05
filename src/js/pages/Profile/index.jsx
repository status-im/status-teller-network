import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Row, Col} from "reactstrap";

import UserInformation from '../../components/UserInformation';
import Map from '../../components/Map';
import Offer from './components/Offer';

import metadata from "../../features/metadata";
import prices from "../../features/prices";
import newBuy from "../../features/newBuy";
import network from "../../features/network";

import {addressCompare} from "../../utils/address";
import {checkNotEnoughETH, filterValidGaslessOffers} from "../../utils/transaction";

import './index.scss';
import Loading from "../../components/Loading";

class Profile extends Component {
  componentDidMount() {
    if(addressCompare(this.props.match.params.address, this.props.address)){
      this.props.history.push('/profile');
      return;
    }

    this.props.load(this.props.match.params.address);
    this.props.updateBalance('ETH');
  }

  offerClick = (offerId) => {
    this.props.setOfferId(offerId);
    this.props.history.push('/buy');
  };

  render() {
    const {profile, prices, address} = this.props;
    if(!profile || !prices) return <Loading page={true} />;

    const notEnoughETH = checkNotEnoughETH(this.props.gasPrice, this.props.ethBalance);
    const filteredOffers = filterValidGaslessOffers(profile.offers, notEnoughETH);

    return (
      <div className="seller-profile-container">
        <UserInformation username={profile.username} reputation={profile.reputation}
                         identiconSeed={profile.statusContactCode} nbCreatedTrades={profile.nbCreatedTrades}
                         nbReleasedTrades={profile.nbReleasedTrades}/>
        {profile.coords && <Map coords={{latitude: profile.coords.lat, longitude: profile.coords.lng}} markerOnly={true}
                                markers={[profile.coords]}/>}
        <p className="text-muted mt-2">{profile.location}</p>
        {filteredOffers.length > 0 && <Row>
          <Col xs="12" className="mt-2">
            <h3>Offers</h3>
            <div>
              {filteredOffers.map((offer, index) => <Offer disabled={addressCompare(profile.address, address) || addressCompare(offer.arbitrator, address)}
                                                           key={index}
                                                           offer={offer}
                                                           prices={prices}
                                                           onClick={() => this.offerClick(offer.id)}/>)}
            </div>
            { notEnoughETH && <p>Other assets are hidden until you have ETH in your wallet</p>}
          </Col>
        </Row>}
      </div>
    );
  }
}

Profile.propTypes = {
  match: PropTypes.object,
  load: PropTypes.func,
  history: PropTypes.object,
  profile: PropTypes.object,
  setOfferId: PropTypes.func,
  prices: PropTypes.object,
  address: PropTypes.string,
  gasPrice: PropTypes.string,
  updateBalance: PropTypes.func,
  ethBalance: PropTypes.string
};

const mapStateToProps = (state, props) => {
  const userAddress = props.match.params.address;
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    profile: metadata.selectors.getProfile(state, userAddress),
    prices: prices.selectors.getPrices(state),
    gasPrice: network.selectors.getNetworkGasPrice(state),
    ethBalance: network.selectors.getBalance(state, 'ETH')
  };
};

export default connect(
  mapStateToProps,
  {
    setOfferId: newBuy.actions.setOfferId,
    load: metadata.actions.load,
    updateBalance: network.actions.updateBalance
  }
)(withRouter(Profile));
