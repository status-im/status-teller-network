import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";
import classnames from 'classnames';
import actionNeededIcon from '../../../../images/action-needed.svg';

const ProfileButton = ({linkTo, image, imageComponent, title, subtitle, active}) => (
  <Link to={linkTo} className="profile-button">
    <Row className="mt-4 mb-4">
      <Col xs="12 my-auto">
        <span className="float-left mr-2 profile-button-icon">
            <RoundedIcon image={image} imageComponent={imageComponent} bgColor="blue" />
        </span>
        <h6 className={classnames("m-0 font-weight-normal profile-button-title", {'line-height-40': !subtitle})}>
          {title}
          {active && <img alt="action needed icon" src={actionNeededIcon} className="ml-2"/>}
        </h6>
        {subtitle && <span className="text-muted text-small">{subtitle}</span>}
      </Col>
    </Row>
  </Link>
);

ProfileButton.propTypes = {
  linkTo: PropTypes.string,
  image: PropTypes.string,
  imageComponent: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  active: PropTypes.bool
};

export default ProfileButton;
