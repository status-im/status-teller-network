import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import ChatIcon from "../../../../images/read-chat.svg";
import { stringToContact } from '../../../utils/strings';
import {withTranslation} from "react-i18next";

const ContactUser = ({t, isStatus, userInfo, isBuyer, onClick}) => {
  const userContactObject = stringToContact(userInfo.contactData);

  const button = <Row className="mt-4">
    <Col xs="2">
      <RoundedIcon image={ChatIcon} bgColor="blue"/>
    </Col>
    <Col xs="10 my-auto">
      <h6 className="m-0 font-weight-normal">
        {t('escrow.openChat.chatWith', {person: isBuyer ? t('general.smallCaseBuyer') : t('general.smallCaseSeller')})}
      </h6>
    </Col>
  </Row>;

  if (isStatus && userContactObject.method === 'Status') {
    return <a href={"https://get.status.im/user/" + userContactObject.userId}
              rel="noopener noreferrer" target="_blank">{button}</a>;
  }

  return <span className="clickable text-primary" onClick={onClick}>{button}</span>;
};

ContactUser.propTypes = {
  t: PropTypes.func,
  userInfo: PropTypes.object,
  isBuyer: PropTypes.bool,
  onClick: PropTypes.func,
  isStatus: PropTypes.bool
};

export default withTranslation()(ContactUser);
