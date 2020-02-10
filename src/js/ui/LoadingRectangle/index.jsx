import React from 'react';
import PropTypes from "prop-types";

import './index.scss';

const LoadingRectangle = ({className}) => (
  <span className={"loading-gradient " + className}/>
);

LoadingRectangle.propTypes = {
  className: PropTypes.string
};

export default LoadingRectangle;
