import {compactAddress} from "./address";

export const formatArbitratorName = (user, address, noUsernameLabel, index) => {
  if (!user) return address + ' - Loading...';
  return `${index >= 0 ? index + 1 + ' - ' : ""}${user.username || (noUsernameLabel ? noUsernameLabel : "No username available")} (${compactAddress(address, 3)})  ${user.location ? ' from ' + user.location : ''} - ${user.upCount || 0}↑  ${user.downCount || 0}↓`;
};
