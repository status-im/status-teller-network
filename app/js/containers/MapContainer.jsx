import React, { Component, Fragment } from 'react';
import Map from '../components/Map';
import license from "../features/license";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import SellerList from "../components/SellerList";

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coords: null,
      error: null
    };

    navigator.geolocation.getCurrentPosition(pos => {
      this.setState({coords: pos.coords});
    }, err => {
      this.setState({error: err.message});
    });
  }

  componentDidMount() {
    this.props.getLicenseOwners();
  }

  render() {
    const {error, coords} = this.state;
    return (
      <Fragment>
        <h1>Map</h1>
        <Map error={error} coords={coords}/>
        <SellerList licenseOwners={this.props.licenseOwners} licenseOwnersError={this.props.licenseOwnersError}/>
      </Fragment>
    );
  }
}

MapContainer.propTypes = {
  getLicenseOwners: PropTypes.func,
  licenseOwners: PropTypes.array,
  licenseOwnersError: PropTypes.string
};

const mapStateToProps = state => ({
  licenseOwners: license.selectors.licenseOwners(state),
  licenseOwnersError: license.selectors.licenseOwnersError(state)
});

export default connect(
  mapStateToProps,
  {
    getLicenseOwners: license.actions.getLicenseOwners
  }
)(MapContainer);
