import React from 'react';
import PropTypes from 'prop-types';

import './LogoCircle.scss';

const LogoCircle = ({children}) => (
  <p className="rounded-circle bg-primary logo-circle text-center">{children}</p>
);

LogoCircle.propTypes = {
  children: PropTypes.string
};

export default LogoCircle;
