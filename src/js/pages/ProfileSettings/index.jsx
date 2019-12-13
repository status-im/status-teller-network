import React, {Fragment} from "react";
import {withTranslation} from "react-i18next";
import PropTypes from "prop-types";
import ProfileButton from "../MyProfile/components/ProfileButton";
import iconChat from "../../../images/read-chat.svg";
import iconBell from "../../../images/bell.svg";
import iconSettings from "../../../images/settings.svg";
import { ReactComponent as iconFlag } from "../../../images/flag.svg";

const ProfileSettings = ({t}) => (<Fragment>
  <h2 className="mb-4 mt-3">{t('profileSettings.title')}</h2>
  <ProfileButton linkTo="/profile/settings/contact" image={iconChat} title={t('profileSettings.contactInfo')}/>
  <ProfileButton linkTo="/profile/settings/location" imageComponent={iconFlag} title={t('profileSettings.location')}/>
  <ProfileButton linkTo="/profile/settings/notifications" image={iconBell} title={t('profileSettings.notifications')}/>
  <ProfileButton linkTo="/profile/settings/cache" image={iconSettings} title={t('profileSettings.cache')}/>
</Fragment>);


ProfileSettings.propTypes = {
  t: PropTypes.func
};

export default withTranslation()(ProfileSettings);
