import React from 'react';
import {Row, Col} from 'reactstrap';
import {faComment} from "@fortawesome/free-solid-svg-icons";
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';

const OpenChat = ({statusContactCode}) => (
  <a href={"https://get.status.im/user/" + statusContactCode} rel="noopener noreferrer" target="_blank">
  <Row className="mt-4">
    <Col xs="2">
      <RoundedIcon icon={faComment} bgColor="grey"/>
    </Col>
    <Col xs="10 my-auto">
      <h5 className="m-0">Open Chat</h5>
    </Col>
  </Row>
  </a>
);

OpenChat.propTypes = {
  statusContactCode: PropTypes.string
};

export default OpenChat;
