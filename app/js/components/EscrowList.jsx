/*global web3*/
import React from 'react';
import {Card, CardBody, CardHeader, CardTitle, Table, Button, Alert} from 'reactstrap';
import PropTypes from 'prop-types';
import {getEscrowState, escrowStates} from "../features/escrow/helpers";
import Rating from "./Rating";
import { withNamespaces } from 'react-i18next';

function getEscrowStateText(escrow, t) {
  switch (getEscrowState(escrow)) {
    case escrowStates.released:
      return <p className="text-success">{t('escrowList.state.released')}</p>;
    case escrowStates.canceled:
      return <p className="text-warning">{t('escrowList.state.canceled')}</p>;
    case escrowStates.expired:
      return <p className="text-danger">{t('escrowList.state.expired')}</p>;
    case escrowStates.waiting:
    default:
      return <p className="text-primary">{t('escrowList.state.waiting')}</p>;
  }
}

const EscrowList = (props) => (
  <Card className="mt-2">
    <CardHeader>
      <CardTitle>{props.t('escrowList.title')}</CardTitle>
    </CardHeader>
    <CardBody>
      {props.loading && <p>{props.t('escrowList.loading')}</p>}
      {props.error &&
      <Alert color="danger">{props.t('escrowList.error')} {props.error}</Alert>}
      {(!props.escrows || props.escrows.length === 0) && !props.loading && <p>{props.t('escrowList.empty')}</p>}
      {props.escrows && props.escrows.length > 0 && <Table>
        <thead>
        <tr>
          <th>#</th>
          <th>{props.t('escrowList.head.state')}</th>
          <th>{props.escrows[0].buyer === web3.eth.defaultAccount ? props.t('escrowList.head.seller') : props.t('escrowList.head.buyer')}</th>
          <th>{props.t('escrowList.head.value')}</th>
          <th>{props.t('escrowList.head.expiration')}</th>
          <th>{props.t('escrowList.head.actions')}</th>
        </tr>
        </thead>
        <tbody>
        {props.escrows.map(escrow =>
          <tr key={escrow.escrowId}>
            <th scope="row">{escrow.escrowId}</th>
            <td>{getEscrowStateText(escrow, props.t)}</td>
            <td>{escrow.buyer === web3.eth.defaultAccount ? escrow.seller : escrow.buyer}</td>
            <td>{escrow.amount}</td>
            <td>{new Date(escrow.expirationTime * 1000).toString()}</td>
            <td>
              {getEscrowState(escrow) === escrowStates.waiting && escrow.seller === web3.eth.defaultAccount &&
              <Button color="success" size="sm" className="mb-1" block
                      onClick={() => props.releaseEscrow(escrow.escrowId)}>
                {props.t('escrowList.actions.release')}
              </Button>}

              {getEscrowState(escrow) === escrowStates.expired && escrow.seller === web3.eth.defaultAccount &&
              <Button color="warning" size="sm" block
                      onClick={() => props.cancelEscrow(escrow.escrowId)}>{props.t('escrowList.actions.cancel')}</Button>}

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
  t: PropTypes.func,
  escrows: PropTypes.array,
  releaseEscrow: PropTypes.func,
  cancelEscrow: PropTypes.func,
  rateTransaction: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default withNamespaces()(EscrowList);
