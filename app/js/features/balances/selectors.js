export const getSNTBalance = (state, address) => {
  if (!state.balances[address]) {
    return 0;
  }

  return state.balances[address].snt || 0;
};
