import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';

const EscrowDetail = ({escrow}) => <Row className="mt-4">
    <Col xs="10">
      <h3>Trade details</h3>
      <p className="m-0">{(escrow.fiatAmount / 100).toFixed(2)} {escrow.offer.currency} for {escrow.tokenAmount} {escrow.token.symbol}</p>
      <p className="m-0">{escrow.token.symbol} Price = {((escrow.fiatAmount / 100) / escrow.tokenAmount).toFixed(4)} {escrow.offer.currency}</p>
      <p className="m-0">Took place on {escrow.createDate}</p>
    </Col>
  </Row>;


EscrowDetail.propTypes = {
  escrow: PropTypes.object
};

export default EscrowDetail;
