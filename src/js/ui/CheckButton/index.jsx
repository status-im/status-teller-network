import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle, faCheck} from "@fortawesome/free-solid-svg-icons";
import {faCircle as faCircleReg} from "@fortawesome/free-regular-svg-icons";
import classnames from 'classnames';

import "./index.scss";

const CheckButton = ({children, active, onClick, size, align, isCheckBox, inline, className}) => (
  <Button className={classnames('check-button', 'text-left', 'text-body', 'px-0', 'py-2', 'v-align-center', 'mb-2', {
    large: size === 'l',
    small: size === 's',
    'mr-2': inline && align === 'left',
    'ml-2': inline && align === 'right',
    [className]: !!className
  })} size="lg" color="link" block={!inline} active={active} onClick={onClick}>
    {!isCheckBox && <FontAwesomeIcon className={classnames('radio-box', {
      "float-right": align === "right",
      "float-left": align !== "right",
      "text-primary": active,
      "text-secondary": !active
    })}
                                     icon={active ? faCircleReg : faCircle}/>}
    {isCheckBox && <span className={classnames("d-inline-block check-box text-center", {
      'bg-secondary': !active,
      'bg-primary': active,
      "float-right": align === "right",
      "float-left": align !== "right"
    })}>
      {active && <FontAwesomeIcon className="text-white" icon={faCheck}/>}
    </span>}
    {children}
  </Button>
);

CheckButton.defaultProps = {
  align: "right"
};

CheckButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  align: PropTypes.string,
  className: PropTypes.string,
  active: PropTypes.bool,
  isCheckBox: PropTypes.bool,
  onClick: PropTypes.func,
  size: PropTypes.string,
  inline: PropTypes.bool
};

export default CheckButton;
