import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import './index.scss';

const RoundedIcon = ({icon, image, bgColor}) => (
  <div className={classnames("rounded-icon rounded-circle", {
    'rounded-icon__grey': bgColor === 'grey',
    'rounded-icon__blue': bgColor === 'blue',
    'rounded-icon__red': bgColor === 'red',
    'rounded-icon__green': bgColor === 'green'
  })}>
    {icon && <FontAwesomeIcon icon={icon} className="rounded-icon--icon" size="lg"/>}
    {image && <img src={image} alt="rounded-icon" className="rounded-icon--icon"/>}
  </div>
);

RoundedIcon.propTypes = {
  icon: PropTypes.object,
  image: PropTypes.string,
  bgColor: PropTypes.string
};

export default RoundedIcon;
