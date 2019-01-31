import React, { Component } from 'react';
import Map from '../components/Map';
import license from "../features/license";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";

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

  goToProfile = (address) => {
    this.props.history.push(`/buy/profile/${address}`);
  };

  render() {
    const {error, coords} = this.state;
    return (
      <Map error={error} coords={coords} goToProfile={this.goToProfile}/>
    );
  }
}

MapContainer.propTypes = {
  getLicenseOwners: PropTypes.func,
  licenseOwners: PropTypes.array,
  licenseOwnersError: PropTypes.string,
  history: PropTypes.object,
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
)(withRouter(MapContainer));
