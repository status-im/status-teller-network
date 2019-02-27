import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Button } from 'reactstrap';

const CardEscrow = () => (
  <Card>
    <CardBody className="text-center">
      <h2>Waiting for you to fund the escrow</h2>
      <p>Before accepting the payment you must put the assets into an escrow</p>
      <Button color="primary" onClick={() => {}}>Start</Button>
    </CardBody>
  </Card>
);

CardEscrow.propTypes = {
};

export default CardEscrow;
