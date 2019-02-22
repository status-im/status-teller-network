import React, {Fragment} from 'react';
import {InfoWindow} from "react-google-maps";
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';
import RatingIcon from '../RatingIcon';

const CustomInfoWindow = ({name, address: _address, onClose, onClick, assets, isPositiveRating}) => (
  <InfoWindow onCloseClick={onClose}>
    <Fragment>
      <h4>{name} <RatingIcon isPositiveRating={isPositiveRating}/></h4>
      <p>{assets.join(', ')}</p>
      <Button color="primary" onClick={onClick}>Profile</Button>
    </Fragment>
  </InfoWindow>
);

CustomInfoWindow.propTypes = {
  name: PropTypes.string,
  address: PropTypes.string,
  assets: PropTypes.array,
  onClose: PropTypes.func,
  onClick: PropTypes.func,
  isPositiveRating: PropTypes.bool
};

export default CustomInfoWindow;
