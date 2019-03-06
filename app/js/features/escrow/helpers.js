export const tradeStates = {
  released: 'released', 
  paid: 'paid',
  arbitration_open: 'arbitration_open',
  arbitration_closed: 'arbitration_closed',
  canceled: 'canceled',
  expired: 'expired',
  waiting: 'waiting'
};

export function getTradeStatus(trade) {
  if (trade.released) {
    return tradeStates.released;
  }
  if (trade.paid) {
    if(trade.arbitration && trade.arbitration.open){
      if(trade.arbitration.result !== "0"){
        return tradeStates.arbitration_closed;
      }
      return tradeStates.arbitration_open;
    }
    return tradeStates.paid;
  }
  if (trade.canceled) {
    return tradeStates.canceled;
  }
  // if (trade.expirationTime.valueOf() <= Date.now()) {
  //   return tradeStates.expired;
  // }
  return tradeStates.waiting;
}
