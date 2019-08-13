import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import ChatIcon from "../../../../images/read-chat.svg";

const OpenChat = ({statusContactCode, withBuyer}) => (
  <a href={"https://get.status.im/user/" + statusContactCode} rel="noopener noreferrer" target="_blank">
  <Row className="mt-4">
    <Col xs="2">
      <RoundedIcon image={ChatIcon} bgColor="blue"/>
    </Col>
    <Col xs="10 my-auto">
      <h6 className="m-0 font-weight-normal">Chat with {withBuyer ? 'buyer' : 'seller' }</h6>
    </Col>
  </Row>
  </a>
);

OpenChat.defaultProps = {
  withBuyer: false
};

OpenChat.propTypes = {
  statusContactCode: PropTypes.string,
  withBuyer: PropTypes.bool
};

export default OpenChat;
