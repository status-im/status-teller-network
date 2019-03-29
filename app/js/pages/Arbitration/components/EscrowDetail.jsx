import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';

const EscrowDetail = ({escrow}) => <Row className="mt-4">
    <Col xs="10">
      <h5 className="m-0">Trade details</h5>
      <p className="text-dark m-0">{(escrow.tokenAmount * escrow.assetPrice / 100).toFixed(2)} {escrow.offer.currency} for {escrow.tokenAmount} {escrow.token.symbol}</p>
      <p className="text-dark m-0">{escrow.token.symbol} Price = {escrow.assetPrice / 100} {escrow.offer.currency}</p>
      <p className="text-dark m-0">Took place on {escrow.createDate}</p>
    </Col>
  </Row>;


EscrowDetail.propTypes = {
  escrow: PropTypes.object
};

export default EscrowDetail;
