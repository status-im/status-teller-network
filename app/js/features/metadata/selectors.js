export const getProfile = (state, address) => {
  return {
    ...state.metadata.sellers[address],
    offers: state.metadata.offers[address] || [],
    trades: [],
    reputation: {}
  };
};
