import React from 'react';
import {Row, Col} from 'reactstrap';
import {faComment} from "@fortawesome/free-solid-svg-icons";

import RoundedIcon from "../../../ui/RoundedIcon";

const OpenChat = () => (
  <Row className="mt-4">
    <Col xs="2">
      <RoundedIcon icon={faComment} bgColor="grey"/>
    </Col>
    <Col xs="10">
      Open Chat
    </Col>
  </Row>
);

export default OpenChat;
