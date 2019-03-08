import React from 'react';
import {InfoWindow} from "react-google-maps";
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

const CustomInfoWindow = ({name, address: _address, onClose, onClick, assets}) => (
  <InfoWindow onCloseClick={onClose}>
    <div className="px-3">
      <h4>{name}</h4>
      <p>{assets.join(', ')}</p>
      <Button color="primary" onClick={onClick}>Profile</Button>
    </div>
  </InfoWindow>
);

CustomInfoWindow.propTypes = {
  name: PropTypes.string,
  address: PropTypes.string,
  assets: PropTypes.array,
  onClose: PropTypes.func,
  onClick: PropTypes.func
};

export default CustomInfoWindow;
