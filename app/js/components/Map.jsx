import React, {Component, Fragment} from 'react';
import {compose, withProps} from "recompose";
import {GoogleMap, Marker, withGoogleMap, withScriptjs} from "react-google-maps";
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';

import CustomInfoWindow from './CustomInfoWindow';
import unknownImage from '../../images/unknown.png';

const fakeData = [
  {name: 'Bob', address: '0xb8d851486d1c953e31a44374aca11151d49b8bb3'},
  {name: 'Alice', address: '0xf6d5c6d500cac10ee7e6efb5c1b479cfb789950a'},
  {name: 'Roger', address: '0xf09324e7a1e2821c2f7a4a47675f9cf0b1a5eb7f'},
  {name: 'Gerard', address: '0xfbaf82a227dcebd2f9334496658801f63299ba24'},
  {name: 'Dick', address: '0x774b5341944deac70199a4750556223cb008949b'},
  {name: 'Patricia', address: '0x4801428dad07e7c2401d033d195116011fc4e400'},
  {name: 'Magda', address: '0xcf08befbc01a5b02ea09d840797d6b4565d4d535'},
  {name: 'Ginette', address: '0x1a2f3b98e434c02363f3dac3174af93c1d690914'},
  {name: 'Dillard', address: '0x4a17f35f0a9927fb4141aa91cbbc72c1b31598de'},
  {name: 'Memphis', address: '0xdf18cb4f2005bc52f94e9bd6c31f7b0c6394e2c2'}
];

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeMarkers: {}
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
    return  (Math.random() < 0.5 ? -1 : 1) * Math.random() * seed;
  }

  render() {
    let {coords, error, t} = this.props;
    if (error && error.indexOf('denied') > -1) {
      coords = {
        latitude: 45.492611,
        longitude: -73.617959
      };
      error = t('map.denied');
    } else if (error) {
      return (<p>{error}</p>);
    }

    if (!coords) {
      return t('map.loading');
    }

    // TODO remove this when we have actual data
    if (!fakeData[0].lat) {
      fakeData.forEach(fake => {
        fake.lat = coords.latitude + this.getRandomNum(0.01);
        fake.lng = coords.longitude + this.getRandomNum(0.01);
      });
    }

    return (<Fragment>
      {error && <p>{error}</p>}
      <GoogleMap
        defaultZoom={14}
        defaultCenter={{lat: coords.latitude, lng: coords.longitude}}
      >
        {fakeData.map(fake => {
          return (<Marker
            key={`marker-${fake.address}`}
            onClick={() => this.onMarkerClick(fake.address)}
            position={{lat: fake.lat, lng: fake.lng}}
            icon={unknownImage}
          >{this.state.activeMarkers[fake.address] &&
          <CustomInfoWindow onClose={() => this.onClose(fake.address)} name={fake.name}
                            address={fake.address}/>}
          </Marker>);
        })}
      </GoogleMap>
    </Fragment>);
  }
}

Map.propTypes = {
  t: PropTypes.func,
  coords: PropTypes.object,
  error: PropTypes.string,
  google: PropTypes.object
};

export const MapComponent = Map;
export default compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyALAskxuamVIKbyUiw6CxgfVTk6YM2wYu8&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{height: `100%`}}/>,
    containerElement: <div style={{height: `400px`}}/>,
    mapElement: <div style={{height: `100%`}}/>
  }),
  withScriptjs,
  withGoogleMap
)(withNamespaces()(Map));

