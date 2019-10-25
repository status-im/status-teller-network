import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";

const ProfileButton = ({linkTo, image, title, subtitle}) => (
  <Link to={linkTo} className="profile-button">
    <Row className="mt-2 mb-4">
      <Col xs="12 my-auto">
        <span className="float-left mr-2 profile-button-icon">
            <RoundedIcon image={image} bgColor="blue" />
        </span>
        <h6 className="m-0 font-weight-normal profile-button-title">{title}</h6>
        <span className="text-muted text-small">{subtitle}</span>
      </Col>
    </Row>
  </Link>
);

ProfileButton.propTypes = {
  linkTo: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string
};

export default ProfileButton;
