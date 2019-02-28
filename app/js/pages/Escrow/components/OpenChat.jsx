import React from 'react';
import {Row, Col} from 'reactstrap';
import {faComment} from "@fortawesome/free-solid-svg-icons";

import RoundedIcon from "../../../ui/RoundedIcon";

const OpenChat = () => (
  <Row className="mt-4">
    <Col xs="2">
      <RoundedIcon icon={faComment} bgColor="grey"/>
    </Col>
    <Col xs="10 my-auto">
      <h5 className="m-0">Open Chat</h5>
    </Col>
  </Row>
);

export default OpenChat;
