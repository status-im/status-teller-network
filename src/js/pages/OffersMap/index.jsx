import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {withNamespaces} from "react-i18next";
import {Alert} from "reactstrap";

import Map from '../../components/Map';
import license from "../../features/license";
import metadata from "../../features/metadata";
import network from "../../features/network";
import {addressCompare} from '../../utils/address';

class OffersMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coords: null,
      error: null
    };
  }

  componentDidMount() {
    this.props.getLicenseOwners();
    navigator.geolocation.getCurrentPosition(pos => {
      this.setState({coords: pos.coords});
    }, err => {
      this.setState({error: err.message});
    });
  }

  goToProfile = (address) => {
    this.props.history.push(`/buy/profile/${address}`);
  };

  render() {
    let {error, coords} = this.state;
    const {t, tokens, usersWithOffers} = this.props;

    if (error || !coords || !coords.latitude) {
      coords = {
        latitude: 45.492611,
        longitude: -73.617959
      };
      if (error && error.indexOf('denied') > -1) {
        error = t('map.denied');
      }
    }

    const markers = usersWithOffers.filter(user => user.offers.length && user.coords).map(user => ({
      name: user.username,
      address: user.address,
      assets: user.offers.map(offer => {
        return Object.values(tokens).find(token => addressCompare(token.address, offer.asset)).symbol;
      }),
      lat: user.coords.lat,
      lng: user.coords.lng
    }));

    return (
      <Fragment>
        {error && <Alert color="danger" className="map-error">{error}</Alert>}
        <Map error={error} coords={coords} goToProfile={this.goToProfile} markers={markers}/>
      </Fragment>

    );
  }
}

OffersMap.propTypes = {
  t: PropTypes.func,
  getLicenseOwners: PropTypes.func,
  licenseOwners: PropTypes.array,
  usersWithOffers: PropTypes.array,
  licenseOwnersError: PropTypes.string,
  history: PropTypes.object,
  tokens: PropTypes.object
};

const mapStateToProps = state => ({
  licenseOwners: license.selectors.licenseOwners(state),
  licenseOwnersError: license.selectors.licenseOwnersError(state),
  usersWithOffers: metadata.selectors.getUsersWithOffers(state),
  tokens: network.selectors.getTokens(state)
});

export default connect(
  mapStateToProps,
  {
    getLicenseOwners: license.actions.getLicenseOwners
  }
)(withRouter(withNamespaces()(OffersMap)));
