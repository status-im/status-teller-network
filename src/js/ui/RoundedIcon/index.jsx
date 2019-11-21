import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import './index.scss';
import FundingEscrow from "../../pages/Escrow/components/FundingEscrow";

const RoundedIcon = ({icon, image, bgColor, size, className}) => (
  <span className={classnames("rounded-icon rounded-circle", {
    'rounded-icon__grey': bgColor === 'grey',
    'rounded-icon__blue': bgColor === 'blue',
    'rounded-icon__primary': bgColor === 'primary',
    'rounded-icon__secondary': bgColor === 'secondary',
    'rounded-icon__red': bgColor === 'red',
    'rounded-icon__green': bgColor === 'green',
    [size]: !!size,
    [className]: !!className
  })}>
    {icon && <FontAwesomeIcon icon={icon} className="rounded-icon--icon" size={size}/>}
    {image && <img src={image} alt="rounded-icon" className="rounded-icon--icon" width={size === 'sm' ? 13 : 20} height={size === 'sm' ? 13 : 20}/>}
  </span>
);

FundingEscrow.defaultProps = {
  size: 'lg'
};

RoundedIcon.propTypes = {
  icon: PropTypes.object,
  image: PropTypes.string,
  bgColor: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string
};

export default RoundedIcon;
