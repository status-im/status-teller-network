import React, { Component, Fragment } from 'react';
import Map from '../components/Map';

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

  render() {
    const {error, coords} = this.state;
    return (
      <Fragment>
        <h1>Map</h1>
        <Map error={error} coords={coords}/>
      </Fragment>
    );
  }
}
 
export default MapContainer;
