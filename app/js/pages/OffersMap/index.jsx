import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {withNamespaces} from "react-i18next";
import {Alert} from "reactstrap";

import Map from '../../components/Map';
import license from "../../features/license";

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
    const {t} = this.props;

    if (error && error.indexOf('denied') > -1) {
      coords = {
        latitude: 45.492611,
        longitude: -73.617959
      };
      error = t('map.denied');
    } else if (error) {
      return (<Alert color="danger">{error}</Alert>);
    }

    if (!coords || !coords.latitude) {
      return <p><FontAwesomeIcon icon={faSpinner} spin/>{t('map.loading')}</p>;
    }

    return (
      <Fragment>
        {error && <p className="text-danger">{error}</p>}
        <Map error={error} coords={coords} goToProfile={this.goToProfile}/>
      </Fragment>

    );
  }
}

OffersMap.propTypes = {
  t: PropTypes.func,
  getLicenseOwners: PropTypes.func,
  licenseOwners: PropTypes.array,
  licenseOwnersError: PropTypes.string,
  history: PropTypes.object
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
)(withRouter(withNamespaces()(OffersMap)));
