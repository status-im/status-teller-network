import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import './index.scss';

const RoundedIcon = ({icon, image, imageComponent, text, bgColor, size, className, onClick}) => {
  let sizePx;
  switch (size) {
    case 'xs': sizePx = 10; break;
    case 'sm': sizePx = 13; break;
    case 'md': sizePx = 20; break;
    default: sizePx = null;
  }
  return (<span onClick={onClick} className={classnames("rounded-icon rounded-circle", {
    'rounded-icon__grey': bgColor === 'grey',
    'rounded-icon__blue': bgColor === 'blue',
    'rounded-icon__primary': bgColor === 'primary',
    'rounded-icon__secondary': bgColor === 'secondary',
    'rounded-icon__red': bgColor === 'red',
    'rounded-icon__green': bgColor === 'green',
    [size]: !!size,
    [className]: !!className
  })}>
    {text && <span className="text-icon">{text}</span>}
    {icon && <FontAwesomeIcon icon={icon} className="rounded-icon--icon" size={size}/>}
    {image && <img src={image} alt="rounded-icon" className="rounded-icon--icon" width={sizePx}
                   height={sizePx}/>}
    {imageComponent && imageComponent.render()}
  </span>);
};

RoundedIcon.defaultProps = {
  size: 'lg'
};

RoundedIcon.propTypes = {
  icon: PropTypes.object,
  image: PropTypes.string,
  imageComponent: PropTypes.object,
  text: PropTypes.string,
  bgColor: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default RoundedIcon;
