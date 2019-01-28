export const fiat = state => state.seller.fiat;

export const margin = state => {
  const {rate, isAbove} = state.seller;
  return { rate, isAbove};
};
