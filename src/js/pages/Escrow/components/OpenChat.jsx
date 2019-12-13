import React, {Component} from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import ChatIcon from "../../../../images/read-chat.svg";
import { stringToContact } from '../../../utils/strings';
import {withTranslation} from "react-i18next";

class OpenChat extends Component {

  render(){
    const {t, buyerContactData, sellerContactData, isStatus, withBuyer, onClick} = this.props;

    const buyerContactObj = stringToContact(buyerContactData);
    const sellerContactObj = stringToContact(sellerContactData);

    const button = <Row className="mt-4">
      <Col xs="2">
        <RoundedIcon image={ChatIcon} bgColor="blue"/>
      </Col>
      <Col xs="10 my-auto">
        <h6 className="m-0 font-weight-normal">
          {t('escrow.openChat.chatWith', {person: withBuyer ? t('general.smallCaseBuyer') : t('general.smallCaseSeller')})}
        </h6>
      </Col>
    </Row>;

    if (isStatus && buyerContactObj.method === sellerContactObj.method && buyerContactObj.method === 'Status') {
      return <a href={"https://get.status.im/user/" + (withBuyer ? buyerContactObj.userId : sellerContactObj.userId)}
                rel="noopener noreferrer" target="_blank">{button}</a>;
    }

    return <span className="clickable text-primary" onClick={onClick}>{button}</span>;
  }
}

OpenChat.defaultProps = {
  withBuyer: false,
  isStatus: false
};

OpenChat.propTypes = {
  t: PropTypes.func,
  buyerContactData: PropTypes.string,
  sellerContactData: PropTypes.string,
  withBuyer: PropTypes.bool,
  isStatus: PropTypes.bool,
  onClick: PropTypes.func
};

export default withTranslation()(OpenChat);
