export const tradeStates = {
  released: 'released', 
  funded: 'funded',
  paid: 'paid',
  arbitration_open: 'arbitration_open',
  arbitration_closed: 'arbitration_closed',
  canceled: 'canceled',
  expired: 'expired',
  waiting: 'waiting'
};

export const escrowStatus = {
  CREATED: '0',
  FUNDED: '1',
  PAID: '2',
  RELEASED: '3',
  CANCELED: '4'
};

export function getTradeStatus(trade) {
  switch(trade.status) {
    case escrowStatus.RELEASED: return tradeStates.released;
    case escrowStatus.FUNDED: return tradeStates.funded;
    case escrowStatus.PAID: {
      if(trade.arbitration && trade.arbitration.open){
        if(trade.arbitration.result !== "0"){
          return tradeStates.arbitration_closed;
        }
        return tradeStates.arbitration_open;
      }
      return tradeStates.paid;
    }
    case escrowStatus.CANCELED: return tradeStates.canceled;
    default: return tradeStates.waiting;
  }
}
