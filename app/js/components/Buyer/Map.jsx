/*global google*/
import React, {Component} from 'react';
import {compose, withProps} from "recompose";
import {GoogleMap, Marker, withGoogleMap, withScriptjs} from "react-google-maps";
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import SearchBox from "react-google-maps/lib/components/places/SearchBox";
import SearchBar from '../SearchBar';

import CustomInfoWindow from '../CustomInfoWindow';
import dot from '../../../images/Ellipse.png';

const fakeData = [
  {
    name: 'Bob',
    address: '0xb8d851486d1c953e31a44374aca11151d49b8bb3',
    assets: ['ETH', 'SNT', 'DAI'],
    isPositiveRating: true
  },
  {
    name: 'Alice',
    address: '0xf6d5c6d500cac10ee7e6efb5c1b479cfb789950a',
    assets: ['ETH', 'SNT', 'DAI'],
    isPositiveRating: false
  },
  {
    name: 'Roger',
    address: '0xf09324e7a1e2821c2f7a4a47675f9cf0b1a5eb7f',
    assets: ['ETH', 'SNT', 'DAI'],
    isPositiveRating: true
  },
  {
    name: 'Gerard',
    address: '0xfbaf82a227dcebd2f9334496658801f63299ba24',
    assets: ['ETH', 'SNT', 'DAI'],
    isPositiveRating: true
  },
  {name: 'Dick', address: '0x774b5341944deac70199a4750556223cb008949b', assets: ['ETH', 'DAI'], isPositiveRating: true},
  {
    name: 'Patricia',
    address: '0x4801428dad07e7c2401d033d195116011fc4e400',
    assets: ['ETH', 'SNT', 'DAI'],
    isPositiveRating: false
  },
  {
    name: 'Magda',
    address: '0xcf08befbc01a5b02ea09d840797d6b4565d4d535',
    assets: ['ETH', 'SNT', 'DAI'],
    isPositiveRating: true
  },
  {
    name: 'Ginette',
    address: '0x1a2f3b98e434c02363f3dac3174af93c1d690914',
    assets: ['ETH', 'SNT'],
    isPositiveRating: false
  },
  {
    name: 'Dillard',
    address: '0x4a17f35f0a9927fb4141aa91cbbc72c1b31598de',
    assets: ['SNT', 'DAI'],
    isPositiveRating: true
  },
  {
    name: 'Memphis',
    address: '0xdf18cb4f2005bc52f94e9bd6c31f7b0c6394e2c2',
    assets: ['ETH', 'SNT', 'DAI'],
    isPositiveRating: true
  }
];

export class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeMarkers: {},
      center: {lat: props.coords.latitude, lng: props.coords.longitude}
    };
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

  getRandomNum(seed = 1) {
    return (Math.random() < 0.5 ? -1 : 1) * Math.random() * seed;
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
    this.generateFakeData(newCenter);
    this.setState({
      center: newCenter
    });
  };

  generateFakeData(center) {
    fakeData.forEach(fake => {
      fake.lat = center.lat + this.getRandomNum(0.01);
      fake.lng = center.lng + this.getRandomNum(0.01);
    });
  }

  render() {
    let {goToProfile, markerOnly} = this.props;
    let {center, activeMarkers} = this.state;

    // TODO remove this when we have actual data
    if (!fakeData[0].lat) {
      this.generateFakeData(center);
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
          <SearchBar className="map-search-form" placeholder="Enter a city or ZIP code"/>
        </SearchBox>}
        {fakeData.map(fake => {
          return (<Marker
          key={`marker-${fake.address}`}
          onClick={() => this.onMarkerClick(fake.address)}
          position={{lat: fake.lat, lng: fake.lng}}
          icon={dot}
          >{activeMarkers[fake.address] && !markerOnly &&
        <CustomInfoWindow onClose={() => this.onClose(fake.address)} name={fake.name} assets={fake.assets}
                          address={fake.address} onClick={() => goToProfile(fake.address)}
                          isPositiveRating={fake.isPositiveRating}/>}
          </Marker>);
        })}
      </GoogleMap>);
  }
}

Map.propTypes = {
  t: PropTypes.func,
  goToProfile: PropTypes.func,
  coords: PropTypes.object.isRequired,
  google: PropTypes.object,
  markerOnly: PropTypes.bool
};

export default compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyALAskxuamVIKbyUiw6CxgfVTk6YM2wYu8&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{height: `100%`}}/>,
    containerElement: <div className="map-component"/>,
    mapElement: <div style={{height: `100%`}}/>
  }),
  withScriptjs,
  withGoogleMap
)(withNamespaces()(Map));

