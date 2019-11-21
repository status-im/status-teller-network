import {ARBITRATION_UNSOLVED} from "../arbitration/constants";

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

export const tradeStatesFormatted = {
  waiting: 'Open',
  paid: 'Paid',
  funded: 'Funded',
  released: 'Done',
  arbitration_open: 'Dispute',
  arbitration_closed: 'Resolved',
  canceled: 'Canceled',
  expired: 'Expired'
};

export const eventTypes = {
  paid: 'Paid',
  funded: 'Funded',
  released: 'Released',
  canceled: 'Canceled',
  created: 'Created'
};

export const escrowStatus = {
  CREATED: '0',
  FUNDED: '1',
  PAID: '2',
  RELEASED: '3',
  CANCELED: '4'
};

export function getStatusFromStatusId(id) {
  return Object.keys(escrowStatus)[Object.values(escrowStatus).indexOf(id.toString())];
}

export function getTradeStatus(trade) {
  switch(trade.status) {
    case escrowStatus.RELEASED: return tradeStates.released;
    case escrowStatus.FUNDED: return tradeStates.funded;
    case escrowStatus.PAID: {
      if(trade.arbitration && trade.arbitration.open){
        if(trade.arbitration.result !== ARBITRATION_UNSOLVED){
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

const RELAY_DELAY = (((15 * 60) + 20) * 1000); // Adding 20 seconds buffer since blocks are not mined exactly on this time

export function canRelay(lastActivity) {
  return (lastActivity + RELAY_DELAY) < Date.now();
}

export function nextRelayDate(lastActivity) {
  return new Date(lastActivity + RELAY_DELAY);
}

export const completedStates = [tradeStates.expired, tradeStates.canceled, tradeStates.arbitration_closed, tradeStates.released];
