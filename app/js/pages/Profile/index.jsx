import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Row, Col} from "reactstrap";

import UserInformation from '../../components/UserInformation';
import Map from '../../components//Map';
import Offer from './components/Offer';

import metadata from "../../features/metadata";
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
    const profile = this.props.profile;
    return (
      <div className="seller-profile-container">
        <UserInformation username={profile.username} reputation={profile.reputation} address={profile.address} />
        <h3 className="mt-3">{profile.location}</h3>
        <Map coords={{latitude: 45.492611, longitude: -73.617959}} markerOnly={true}/>
        <p className="text-muted mt-2">Saalestraße 39A, 12055 Berlin</p>
        <Row>
          <Col xs="12" className="mt-2">
            <h3>Offers</h3>
            <div>
              {profile.offers.map((offer, index) => <Offer key={index}
                                                           offer={offer}
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
  setOfferId: PropTypes.func
};

const mapStateToProps = (state, props) => {
  const address = props.match.params.address;
  return {
    profile: metadata.selectors.getProfile(state, address)
  };
};

export default connect(
  mapStateToProps,
  {
    setOfferId: newBuy.actions.setOfferId,
    load: metadata.actions.load
  }
)(withRouter(Profile));
