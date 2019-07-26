import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import {Link} from "react-router-dom";

const ProfileButton = ({linkTo, image, title, subtitle}) => (
  <Link to={linkTo}>
    <Row className="mt-2 mb-4 profile-button">
      <Col xs="12 my-auto">
        <span className="float-left mr-2">
            <RoundedIcon size="xs" image={image} bgColor="blue" />
        </span>
        <h6 className="m-0 font-weight-normal">{title}</h6>
        <span className="text-muted text-small">{subtitle}</span>
      </Col>
    </Row>
  </Link>
);


export default ProfileButton;
