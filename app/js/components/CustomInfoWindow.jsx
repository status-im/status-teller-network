import React from 'react';
import {InfoWindow} from "react-google-maps";
import PropTypes from 'prop-types';

const CustomInfoWindow = ({name, address, onClose}) => (
  <InfoWindow onCloseClick={onClose}>
    <div>
      <h4>{name}</h4>
      <p>{address}</p>
    </div>
  </InfoWindow>
);

CustomInfoWindow.propTypes = {
  name: PropTypes.string,
  address: PropTypes.string,
  onClose: PropTypes.func
};

export default CustomInfoWindow;
