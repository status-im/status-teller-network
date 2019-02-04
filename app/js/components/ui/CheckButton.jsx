import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";

import "./CheckButton.scss";

const CheckButton = ({children, active, onClick}) => (
  <Button className="check-button text-left text-dark" size="lg" color="link" block active={active} onClick={onClick}>
    {children}
    {active &&
      <FontAwesomeIcon className="float-right" icon={faCheck}/>
    }
  </Button>
);

CheckButton.propTypes = {
  children: PropTypes.string,
  active: PropTypes.bool,
  onClick: PropTypes.func
};

export default CheckButton;
