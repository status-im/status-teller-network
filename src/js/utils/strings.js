import {compactAddress} from "./address";

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

export const getContactData = (method, userId) => {
  return method + ':' + userId;
};
