import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import Identicon from "../../../components/UserInformation/Identicon";
import classnames from "classnames";

const ContactUser = ({username, statusContactCode, isBuyer}) => (
  <a href={"https://get.status.im/user/" + statusContactCode} rel="noopener noreferrer" target="_blank">
    <Row className="mt-3 gutterBottom">
      <Col xs="2">
        <div className="rounded-icon rounded-circle rounded-icon__blue">
          <Identicon seed={statusContactCode} className="rounded-circle border" scale={5}/>
        </div>
        <span className={classnames("icon-badge", {'seller-text': !isBuyer, 'buyer-text': isBuyer})}>{isBuyer ? 'Buyer' : 'Seller'}</span>
      </Col>
      <Col xs="10" className="my-auto">
        <h6 className="m-0">Contact {username}</h6>
      </Col>
    </Row>
  </a>
);

ContactUser.propTypes = {
  username: PropTypes.string,
  statusContactCode: PropTypes.string,
  isBuyer: PropTypes.bool
};

export default ContactUser;
