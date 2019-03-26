import React from 'react';
import {Row, Col, Button} from "reactstrap";

const FundEscrow = () => <div>
  <Row>
    <Col>
      <h4>Approve token</h4>
      <p>You authorize the contract to transfer [NAME OF THE TOKEN] on your behalf. This can only occur when you approve a transation to authorize the transfer</p>
    </Col>
  </Row>
  <Row className="mt-4">
  <Col xs={3} />
  <Col xs={6}>
    <Button color="primary" block>approve</Button>
  </Col>
  <Col xs={3} />
  </Row>
</div>;

export default FundEscrow;
