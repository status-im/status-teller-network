export const escrowStates = {
  released: 'released', 
  paid: 'paid',
  arbitration_open: 'arbitration_open',
  arbitration_closed: 'arbitration_closed',
  canceled: 'canceled',
  expired: 'expired',
  waiting: 'waiting'
};

export function getEscrowState(escrow) {
  if (escrow.released) {
    return escrowStates.released;
  }
  if (escrow.paid) {
    if(escrow.arbitration && escrow.arbitration.open){
      if(escrow.arbitration.result !== "0"){
        return escrowStates.arbitration_closed;
      }
      return escrowStates.arbitration_open;
    }
    return escrowStates.paid;
  }
  if (escrow.canceled) {
    return escrowStates.canceled;
  }
  if (escrow.expired <= Date.now() / 1000) {
    return escrowStates.expired;
  }
  return escrowStates.waiting;
}
