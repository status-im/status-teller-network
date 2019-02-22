import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle} from "@fortawesome/free-solid-svg-icons";
import {faCircle as faCircleReg} from "@fortawesome/free-regular-svg-icons";
import classnames from 'classnames';

import "./index.scss";

const CheckButton = ({children, active, onClick, size}) => (
  <Button className={classnames('check-button', 'text-left', 'text-body', 'px-0', 'py-2', 'v-align-center', 'mb-2', {
    large: size === 'l',
    small: size === 's'
  })} size="lg" color="link" block active={active} onClick={onClick}>
    {children}
    <FontAwesomeIcon className={classnames("float-right", {"text-primary": active, "text-secondary": !active})}
                     icon={active ? faCircleReg : faCircle}/>
  </Button>
);

CheckButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  active: PropTypes.bool,
  onClick: PropTypes.func,
  size: PropTypes.string
};

export default CheckButton;
