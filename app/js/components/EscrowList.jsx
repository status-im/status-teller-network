/*global web3*/
import React from 'react';
import {Card, CardBody, CardHeader, CardTitle, Table, Button, Alert} from 'reactstrap';
import PropTypes from 'prop-types';
import {getEscrowState, escrowStates} from "../features/escrow/helpers";
import Rating from "./Rating";

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
      return <p className="text-primary">Waiting</p>;
  }
}

const EscrowList = (props) => (<Card className="mt-2">
    <CardHeader>
      <CardTitle>Escrow List</CardTitle>
    </CardHeader>
    <CardBody>
      {props.loading && <p>Loading...</p>}
      {props.error &&
      <Alert color="danger">Error: {props.error}</Alert>}
      {(!props.escrows || props.escrows.length === 0) && !props.loading && <p>No Escrows</p>}
      {props.escrows && props.escrows.length > 0 && <Table>
        <thead>
        <tr>
          <th>#</th>
          <th>State</th>
          <th>{props.escrows[0].buyer === web3.eth.defaultAccount ? 'Seller' : 'Buyer'}</th>
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
            <td>{escrow.buyer === web3.eth.defaultAccount ? escrow.seller : escrow.buyer}</td>
            <td>{escrow.amount}</td>
            <td>{new Date(escrow.expirationTime * 1000).toString()}</td>
            <td>
              {getEscrowState(escrow) === escrowStates.waiting && escrow.seller === web3.eth.defaultAccount &&
              <Button color="success" size="sm" className="mb-1" block
                      onClick={() => props.releaseEscrow(escrow.escrowId)}>
                Release
              </Button>}
              {getEscrowState(escrow) === escrowStates.expired && escrow.seller === web3.eth.defaultAccount &&
              <Button color="warning" size="sm" block
                      onClick={() => props.cancelEscrow(escrow.escrowId)}>Cancel</Button>}
              {getEscrowState(escrow) !== escrowStates.waiting && escrow.buyer === web3.eth.defaultAccount &&
              <Rating rating={escrow.rating} rateTransaction={props.rateTransaction}
                      escrowId={escrow.escrowId}/>}
            </td>
          </tr>)}
        </tbody>
      </Table>}
    </CardBody>
  </Card>
);

EscrowList.propTypes = {
  escrows: PropTypes.array,
  releaseEscrow: PropTypes.func,
  cancelEscrow: PropTypes.func,
  rateTransaction: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default EscrowList;
