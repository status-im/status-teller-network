import React, {Fragment} from 'react';
import {Card, CardBody, CardHeader, CardTitle, Table, Button} from 'reactstrap';
import PropTypes from 'prop-types';

const escrowStates = {
  released: 'released',
  canceled: 'canceled',
  expired: 'expired',
  waiting: 'waiting'
};

function getEscrowState(escrow) {
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

function getEscrowStateText(escrow) {
  switch (getEscrowState(escrow)) {
    case escrowStates.released:
      return <p className="text-success">Released</p>;
    case escrowStates.canceled:
      return <p className="text-warning">Canceled</p>;
    case escrowStates.expired:
      return <p className="text-danger">Expired</p>;
    case escrowStates.waiting:
    default:
      return <p className="text-success">Released</p>;
  }
}

const EscrowList = (props) => (<Card className="mt-2">
    <CardHeader>
      <CardTitle>Escrow List</CardTitle>
    </CardHeader>
    <CardBody>
      {props.escrows && props.escrows.length && <Table>
        <thead>
        <tr>
          <th>#</th>
          <th>State</th>
          <th>Buyer</th>
          <th>Value</th>
          <th>Expiration</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {props.escrows.map(escrow =>
          <tr key={escrow.escrowId}>
            <th scope="row">{escrow.escrowId}</th>
            <td>{getEscrowStateText(escrow)}</td>
            <td>{escrow.buyer}</td>
            <td>{escrow.amount}</td>
            <td>{new Date(escrow.expirationTime * 1000).toString()}</td>
            <td>
              {getEscrowState(escrow) === escrowStates.waiting &&
              <Fragment>
                <Button color="success" size="sm" className="mb-1" block>Release</Button>
                <Button color="warning" size="sm" block>Cancel</Button>
              </Fragment>}
            </td>
          </tr>)}
        </tbody>
      </Table>}
    </CardBody>
  </Card>
);

EscrowList.propTypes = {
  escrows: PropTypes.array
};

export default EscrowList;
