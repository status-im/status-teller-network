export const getProfile = (state, address) => {
  return {
    address,
    ...state.metadata.sellers[address],
    offers: state.metadata.offers[address] || [],
    trades: [],
    reputation: {}
  };
};
