import {compactAddress} from "./address";
import {STATUS} from "../constants/contactMethods";
import Address from "../components/UserInformation/Address";
import React, {Fragment} from "react";

export const formatArbitratorName = (user, address, score, noUsernameLabel, index) => {
  if (!user) return `${index >= 0 ? index + 1 + ' - ' : ""}` + address + ' - Loading...';
  return `${index >= 0 ? index + 1 + ' - ' : ""}${user.username || (noUsernameLabel ? noUsernameLabel : "No username available")} (${compactAddress(address, 3)})  ${user.location ? ' from ' + user.location : ''} - ${score || 0} disputes resolved`;
};

export const stringToContact = (contactData) => {
  const retObj = {
    userId: '',
    method: ''
  };

  if(contactData){
    const items = contactData.split(':');
    if(items[0]) retObj.method = items[0];
    if(items[1]) retObj.userId = items[1];
  }

  return retObj;
};

export function renderContactData(contactData, className = '') {
  const contactObj = stringToContact(contactData);

  if (!contactObj.method) {
    return <p className={"text-muted text-small " + className}>No contact data for this user</p>;
  }

  return <p className={"text-muted text-small addr " + className}>
    {contactObj.method}:&nbsp;
    {contactObj.method === STATUS ? <Address disableHover address={contactObj.userId} length={6}/> : contactObj.userId}
  </p>;
}

export function renderContactDetails(t, contactData, address, className = '') {
  const contactObj = stringToContact(contactData);

  return (
    <Fragment>
      {!contactObj.method && <p className={"text-muted text-small " + className}>{t('general.noContactMethodAvailable')}</p>}
      {contactObj.method && <p className={"text-muted text-small addr " + className}>
        {t('general.contactMethod')}: {contactObj.method}
      </p>}
      <p className={"text-muted text-small addr mb-0 " + className}>
      {t('general.address')}: <Address disableHover address={address} length={6}/>
      </p>
    </Fragment>
  );
}

export const getContactData = (method, userId) => {
  return method + ':' + userId;
};

export const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
