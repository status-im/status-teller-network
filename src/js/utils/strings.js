import {compactAddress} from "./address";
import {STATUS} from "../constants/contactMethods";
import Address from "../components/UserInformation/Address";
import React from "react";

export const formatArbitratorName = (user, address, noUsernameLabel, index) => {
  if (!user) return `${index >= 0 ? index + 1 + ' - ' : ""}` + address + ' - Loading...';
  return `${index >= 0 ? index + 1 + ' - ' : ""}${user.username || (noUsernameLabel ? noUsernameLabel : "No username available")} (${compactAddress(address, 3)})  ${user.location ? ' from ' + user.location : ''} - ${user.upCount || 0}↑  ${user.downCount || 0}↓`;
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
