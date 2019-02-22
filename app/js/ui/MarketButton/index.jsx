import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

import "./index.scss";

const MarketButton = ({children, onClick, active}) => (
  <Button className="market-button text-center" size="lg" onClick={onClick} active={active}>
    {children}
  </Button>
);

MarketButton.propTypes = {
  children: PropTypes.string,
  onClick: PropTypes.func,
  active: PropTypes.bool
};

export default MarketButton;


