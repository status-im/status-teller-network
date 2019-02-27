import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import './index.scss';

const RoundedIcon = ({icon, bgColor}) => (
  <span className={classnames("rounded-icon rounded-circle mr-2", {
    'rounded-icon__grey': bgColor === 'grey',
    'rounded-icon__blue': bgColor === 'blue'
  })}>
    <FontAwesomeIcon icon={icon} className="text-center rounded-icon--icon" size="lg"/>
  </span>
);

RoundedIcon.propTypes = {
  icon: PropTypes.object,
  bgColor: PropTypes.string
};

export default RoundedIcon;
