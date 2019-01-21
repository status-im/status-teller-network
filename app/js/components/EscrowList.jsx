/*global web3*/
import React, {Fragment} from 'react';
import {Card, CardBody, CardHeader, CardTitle, Table, Button, Alert} from 'reactstrap';
import PropTypes from 'prop-types';
import {getEscrowState, escrowStates} from "../features/escrow/helpers";
import {SIGNATURE_PAYMENT, SIGNATURE_OPEN_CASE} from "../features/escrow/constants";
import Rating from "./Rating";
import {withNamespaces} from 'react-i18next';
import SignatureDialog from "./SignatureDialog";
import TransactionHash from "./TransactionHash";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

function getEscrowStateText(escrow, t) {
  switch (getEscrowState(escrow)) {
    case escrowStates.released:
      return <p className="text-success">{t('escrowList.state.released')}</p>;
    case escrowStates.paid:
      return <p className="text-primary">{t('escrowList.state.paid')}</p>;
    case escrowStates.canceled:
      return <p className="text-warning">{t('escrowList.state.canceled')}</p>;
    case escrowStates.expired:
      return <p className="text-danger">{t('escrowList.state.expired')}</p>;
    case escrowStates.arbitration_open:
      return <p className="text-danger">{t('escrowList.state.inArbitration')}</p>;
    case escrowStates.arbitration_closed:
      return <p className="text-warning">{t('escrowList.state.arbitrationCompleted')}</p>;
    case escrowStates.waiting:
    default:
      return <p className="text-primary">{t('escrowList.state.waiting')}</p>;
  }
}

const EscrowList = (props) => (
  <Fragment>
    {props.signature && <SignatureDialog open={!!props.signature.message}
                                         onClose={props.closeDialog}
                                         message={{
                                           escrowId: props.signature.escrowId,
                                           message: props.signature.message,
                                           type: props.signature.type
                                         }}>
      {props.signature.type === SIGNATURE_PAYMENT && props.t('escrowList.actions.markAsPaid')}
      {props.signature.type === SIGNATURE_OPEN_CASE && props.t('escrowList.actions.openCase')}
    </SignatureDialog>}
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>{props.t('escrowList.title')}</CardTitle>
      </CardHeader>
      <CardBody>
        {props.loading && <p><FontAwesomeIcon icon={faSpinner} className="loading"/>{props.t('escrowList.loading')}</p>}
        {props.txHash && <TransactionHash txHash={props.txHash}/>}
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
          {props.escrows.map(escrow => {
            escrow.state = getEscrowState(escrow);
            return escrow;
          })
            .map(escrow => <tr key={escrow.escrowId}>
              <th scope="row">{escrow.escrowId}</th>
              <td>{getEscrowStateText(escrow, props.t)}</td>
              <td>{escrow.buyer === web3.eth.defaultAccount ? escrow.seller : escrow.buyer}</td>
              <td>{escrow.amount}</td>
              <td>{escrow.expirationTime.toString()}</td>
              <td>
                {escrow.state === escrowStates.waiting && escrow.seller === web3.eth.defaultAccount &&
                <Button color="success" size="sm" className="mb-1" block
                        onClick={() => props.releaseEscrow(escrow.escrowId)}>
                  {props.t('escrowList.actions.release')}
                </Button>}

                {escrow.state === escrowStates.expired && escrow.seller === web3.eth.defaultAccount &&
                <Button color="warning" size="sm" block
                        onClick={() => props.cancelEscrow(escrow.escrowId)}>{props.t('escrowList.actions.cancel')}</Button>}
                {escrow.state === escrowStates.released && !escrow.arbitration && escrow.buyer === web3.eth.defaultAccount &&
                <Rating rating={escrow.rating} rateTransaction={props.rateTransaction}
                        escrowId={escrow.escrowId}/>}
                {escrow.state === escrowStates.waiting && escrow.buyer === web3.eth.defaultAccount && <Fragment>
                  <Button color="warning" size="sm" block
                          onClick={() => props.payEscrow(escrow.escrowId)}>{props.t('escrowList.actions.markAsPaid')}</Button>
                  <Button color="warning" size="sm" block
                          onClick={() => props.payEscrowSignature(escrow.escrowId)}>{props.t('escrowList.actions.signAsPaid')}</Button>
                </Fragment>}
                {escrow.state === escrowStates.paid && <Fragment>
                  <Button color="warning" size="sm" block
                          onClick={() => props.openCase(escrow.escrowId)}>{props.t('escrowList.actions.openCase')}</Button>
                  <Button color="warning" size="sm" block
                          onClick={() => props.openCaseSignature(escrow.escrowId)}>{props.t('escrowList.actions.openCaseSignature')}</Button>
                </Fragment>
                }

              </td>
            </tr>)}
          </tbody>
        </Table>}
      </CardBody>
    </Card>
  </Fragment>);

EscrowList.propTypes = {
  t: PropTypes.func,
  escrows: PropTypes.array,
  signature: PropTypes.object,
  releaseEscrow: PropTypes.func,
  payEscrow: PropTypes.func,
  payEscrowSignature: PropTypes.func,
  openCase: PropTypes.func,
  openCaseSignature: PropTypes.func,
  cancelEscrow: PropTypes.func,
  closeDialog: PropTypes.func,
  rateTransaction: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  txHash: PropTypes.string
};

export default withNamespaces()(EscrowList);
