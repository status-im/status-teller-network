/*global google*/
import React, {Component} from 'react';
import {compose, withProps} from "recompose";
import {GoogleMap, Marker, withGoogleMap, withScriptjs} from "react-google-maps";
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import SearchBox from "react-google-maps/lib/components/places/SearchBox";
import {API_KEY} from '../../services/googleMap';

import SearchBar from './SearchBar';

import CustomInfoWindow from './CustomInfoWindow';
import dot from '../../../images/Ellipse.png';
import './index.scss';

export class Map extends Component {
  constructor(props) {
    const coords = props.coords || {};
    super(props);

    this.state = {
      activeMarkers: {},
      center: {lat: coords.latitude, lng: coords.longitude},
      error: props.error
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.coords.latitude !== this.props.coords.latitude || oldProps.coords.longitude !== this.props.coords.longitude) {
      this.setState({
        center: {lat: this.props.coords.latitude, lng: this.props.coords.longitude}
      });
    }
  }

  onMarkerClick(markerIndex) {
    const activeMarkers = this.state.activeMarkers;

    if (activeMarkers[markerIndex]) {
      activeMarkers[markerIndex] = false;
      delete activeMarkers[markerIndex];
    } else {
      activeMarkers[markerIndex] = true;
    }

    this.setState({
      activeMarkers
    });
  }

  onClose(markerIndex) {
    const activeMarkers = this.state.activeMarkers;
    activeMarkers[markerIndex] = false;
    delete activeMarkers[markerIndex];

    this.setState({
      activeMarkers
    });
  }

  onPlacesChanged = () => {
    const places = this.searchBox.getPlaces();
    const bounds = new google.maps.LatLngBounds();

    places.forEach(place => {
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    const nextMarkers = places.map(place => ({
      position: place.geometry.location
    }));

    // TODO load new offers
    const newCenter = {lat: nextMarkers[0].position.lat(), lng: nextMarkers[0].position.lng()};
    this.setState({
      center: newCenter
    });
  };

  render() {
    let {t, goToProfile, markerOnly, markers, error} = this.props;
    let {center, activeMarkers} = this.state;

    if (error) {
      return (
        <div>
          {error}
        </div>
      );
    }

    return (
      <GoogleMap
        defaultZoom={14}
        center={center}
        options={{mapTypeControl: false, streetViewControl: false, fullscreenControl: false}}
      >
        {!markerOnly && <SearchBox
          onPlacesChanged={this.onPlacesChanged}
          ref={ref => {
            this.searchBox = ref;
          }}
          controlPosition={google.maps.ControlPosition.BOTTOM_LEFT}
        >
          <SearchBar className="map-search-form" placeholder={t('map.searchPlaceholder')}/>
        </SearchBox>}
        {markers && markers.map(marker => {
          return (<Marker
          key={`marker-${marker.address}`}
          onClick={() => this.onMarkerClick(marker.address)}
          position={{lat: marker.latitude, lng: marker.longitude}}
          icon={dot}
          >{activeMarkers[marker.address] && !markerOnly &&
        <CustomInfoWindow onClose={() => this.onClose(marker.address)} name={marker.name} assets={marker.assets}
                          address={marker.address} onClick={() => goToProfile(marker.address)}/>}
          </Marker>);
        })}
      </GoogleMap>
      );
  }
}

Map.propTypes = {
  t: PropTypes.func,
  goToProfile: PropTypes.func,
  coords: PropTypes.object.isRequired,
  google: PropTypes.object,
  markerOnly: PropTypes.bool,
  markers: PropTypes.array,
  error: PropTypes.string
};

export default compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{height: `100%`}}/>,
    containerElement: <div className="map-component"/>,
    mapElement: <div style={{height: `100%`}}/>
  }),
  withScriptjs,
  withGoogleMap
)(withTranslation()(Map));

