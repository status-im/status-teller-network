/*global web3*/
import React from 'react';
import {Card, CardBody, CardHeader, CardTitle, Table, Alert} from 'reactstrap';
import PropTypes from 'prop-types';
import ArbitrationResult from "./ArbitrationResult";
import {ARBITRATION_UNSOLVED} from "../features/arbitration/constants";

function getArbitrationState(escrow) {
  if(escrow.arbitration.open && escrow.arbitration.result === ARBITRATION_UNSOLVED){
    return <p className="text-danger">In arbitration</p>;
  }
  return <p className="text-success">Arbitration completed</p>;
}

const Address = (props) => <span title={props.address}>{props.address.substring(0, 6) + "..." + props.address.substring(38)}</span>;
Address.propTypes = {
  address: PropTypes.string
};

const ArbitrationList = (props) => <Card className="mt-2">
    <CardHeader>
      <CardTitle>Disputed escrows</CardTitle>
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
          <th>Seller</th>
          <th>Buyer</th>
          <th>Open By</th>
          <th>Value</th>
          <th>Expiration</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {props.escrows.map(escrow =>
          <tr key={escrow.escrowId}>
            <th scope="row">{escrow.escrowId}</th>
            <td>{getArbitrationState(escrow)}</td>
            <td><Address address={escrow.seller} /></td>
            <td><Address address={escrow.buyer} /></td>
            <td>{escrow.buyer === escrow.arbitration.openBy ? 'Buyer' : 'Seller'}</td>
            <td>{escrow.amount}</td>
            <td>{new Date(escrow.expirationTime * 1000).toString()}</td>
            <td>
              <ArbitrationResult decision={parseInt(escrow.arbitration.result, 10)} resolveDispute={props.resolveDispute} escrowId={escrow.escrowId}/>
            </td>
          </tr>)}
        </tbody>
      </Table>}
    </CardBody>
  </Card>

ArbitrationList.propTypes = {
  escrows: PropTypes.array,
  resolveDispute: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default ArbitrationList;
