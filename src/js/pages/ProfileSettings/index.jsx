import React, {Fragment} from "react";
import {withNamespaces} from "react-i18next";
import PropTypes from "prop-types";
import ProfileButton from "../MyProfile/components/ProfileButton";
import iconChat from "../../../images/read-chat.svg";
import iconBell from "../../../images/bell.svg";

const ProfileSettings = ({t}) => (<Fragment>
  <h2 className="mb-4 mt-3">{t('profileSettings.title')}</h2>
  <ProfileButton linkTo="/profile/settings/contact" image={iconChat} title="Contact info"/>
  <ProfileButton linkTo="/profile/settings/notifications" image={iconBell} title="Notifications"/>
</Fragment>);


ProfileSettings.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(ProfileSettings);
