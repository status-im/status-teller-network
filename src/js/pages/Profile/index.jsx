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

import './index.scss';

class Profile extends Component {
  componentDidMount() {
    this.props.load(this.props.match.params.address);
  }

  offerClick = (offerId) => {
    this.props.setOfferId(offerId);
    this.props.history.push('/buy');
  };

  render() {
    const {profile, prices} = this.props;
    return (
      <div className="seller-profile-container">
        <UserInformation username={profile.username} reputation={profile.reputation} identiconSeed={profile.statusContactCode} />
        {profile.coords && <Map coords={{latitude: profile.coords.lat, longitude: profile.coords.lng}} markerOnly={true}
                                markers={[profile.coords]}/>}
        <p className="text-muted mt-2">{profile.location}</p>
        <Row>
          <Col xs="12" className="mt-2">
            <h3>Offers</h3>
            <div>
              {profile.offers.map((offer, index) => <Offer key={index}
                                                           offer={offer}
                                                           prices={prices}
                                                           onClick={() => this.offerClick(offer.id)}/>)}
            </div>
          </Col>
        </Row>
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
  prices: PropTypes.object
};

const mapStateToProps = (state, props) => {
  const address = props.match.params.address;
  return {
    profile: metadata.selectors.getProfile(state, address),
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
