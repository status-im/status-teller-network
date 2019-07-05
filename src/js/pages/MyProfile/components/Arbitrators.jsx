import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import {faGavel} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";

const Arbitrators = () => (
  <Link to={"/arbitrators"}>
    <Row className="mt-2 mb-5">
      <Col xs="1">
        <RoundedIcon size="sm" icon={faGavel} bgColor="blue"/>
      </Col>
      <Col xs="11 my-auto">
        <h6 className="m-0 font-weight-normal">Manage arbitrators</h6>
      </Col>
    </Row>
  </Link>
);


export default Arbitrators;
