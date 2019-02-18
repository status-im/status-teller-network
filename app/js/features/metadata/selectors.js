export const getProfile = (state, address) => {
  const lAddress = address.toLowerCase();
  
  if (!state.metadata.users[lAddress]) {
    return null;
  }

  return {
    address: lAddress,
    ...state.metadata.users[lAddress],
    offers: state.metadata.offers[lAddress] || [],
    trades: [{address: '0xfonwoefowejfwejf', name: 'Alice', value: 2.3, status: 'Open'}],
    reputation: {upCount: 432, downCount: 54}
  };
};

export const getAddOfferStatus = (state) => {
  return state.metadata.addOfferStatus;
};

export const getUpdateUserStatus = (state) => {
  return state.metadata.updateUserStatus;
};
