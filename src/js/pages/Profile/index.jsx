/* global web3 */
import React, { Component } from 'react';
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

import './index.scss';
import Loading from "../../components/Loading";

class Profile extends Component {
  componentDidMount() {
    if(web3.utils.toChecksumAddress(this.props.match.params.address) === this.props.address){
      this.props.history.push('/profile');
      return;
    }

    this.props.load(this.props.match.params.address);
  }

  offerClick = (offerId) => {
    this.props.setOfferId(offerId);
    this.props.history.push('/buy');
  };

  render() {
    const {profile, prices, address} = this.props;
    if(!profile || !prices) return <Loading page={true} />;
    return (
      <div className="seller-profile-container">
        <UserInformation username={profile.username} reputation={profile.reputation}
                         identiconSeed={profile.statusContactCode} nbCreatedTrades={profile.nbCreatedTrades}
                         nbReleasedTrades={profile.nbReleasedTrades}/>
        {profile.coords && <Map coords={{latitude: profile.coords.lat, longitude: profile.coords.lng}} markerOnly={true}
                                markers={[profile.coords]}/>}
        <p className="text-muted mt-2">{profile.location}</p>
        {profile.offers.length > 0 && <Row>
          <Col xs="12" className="mt-2">
            <h3>Offers</h3>
            <div>
              {profile.offers.map((offer, index) => <Offer disabled={web3.utils.toChecksumAddress(profile.address) === address}
                                                           key={index}
                                                           offer={offer}
                                                           prices={prices}
                                                           onClick={() => this.offerClick(offer.id)}/>)}
            </div>
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
  address: PropTypes.string
};

const mapStateToProps = (state, props) => {
  const userAddress = props.match.params.address;
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    profile: metadata.selectors.getProfile(state, userAddress),
    prices: prices.selectors.getPrices(state)
  };
};

export default connect(
  mapStateToProps,
  {
    setOfferId: newBuy.actions.setOfferId,
    load: metadata.actions.load
  }
)(withRouter(Profile));
