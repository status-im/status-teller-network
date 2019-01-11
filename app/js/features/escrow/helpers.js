export const escrowStates = {
  released: 'released',
  canceled: 'canceled',
  expired: 'expired',
  waiting: 'waiting'
};

export function getEscrowState(escrow) {
  if (escrow.released) {
    return escrowStates.released;
  }
  if (escrow.canceled) {
    return escrowStates.canceled;
  }
  if (escrow.expired <= Date.now() / 1000) {
    return escrowStates.expired;
  }
  return escrowStates.waiting;
}
