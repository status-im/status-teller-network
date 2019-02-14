export const getProfile = (state, address) => {
  return {
    address,
    ...state.metadata.sellers[address],
    offers: [{from: 'ETH', to: 'EUR', type: 'Selling', paymentMethod: 'Credit Card', location: 'Berlin', rate: '1.5'}],
    trades: [{address: '0xfonwoefowejfwejf', name: 'Alice', value: 2.3, status: 'Open'}],
    reputation: {upCount: 432, downCount: 54},
    statusContactCode: '0xew09fjwe0jfwjevvrgergrgrgtrjtrkstjgearrwef'
  };
};

export const getAddOfferStatus = (state) => {
  return state.metadata.addOfferStatus;
};
