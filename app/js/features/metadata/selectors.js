export const getProfile = (state, address) => {
  return {
    address,
    ...state.metadata.sellers[address],
    offers: state.metadata.offers[address] || [],
    trades: [],
    reputation: {}
  };
};

export const getAddOfferStatus = (state) => {
  return state.metadata.addOfferStatus;
};
