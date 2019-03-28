/* global web3 */
import React from 'react';
import {Row, Col, Button} from "reactstrap";

const ApproveTokenFunds = ({requiredSNT, sntAllowance, shouldResetSNT, handleApprove, handleReset}) => <div>
  <Row>
    <Col>
      <h4>{shouldResetSNT ? 'Reset SNT token Allowance' : 'Approve SNT token'}</h4>
      {!shouldResetSNT && <p>You authorize the contract to transfer {web3.utils.fromWei(requiredSNT, "ether")} TOKEN on your behalf. This can only occur when you approve a transation to authorize the transfer</p>}
      {shouldResetSNT && <p>Your TOKEN allowance for this contract ({web3.utils.fromWei(sntAllowance, "ether")} TOKEN) is less than the required ({web3.utils.fromWei(requiredSNT, "ether")} TOKEN). Reset your TOKEN allowance before approving the required amount</p>}
    </Col>
  </Row>
  <Row className="mt-4">
  <Col xs={3} />
  <Col xs={6}>
    {shouldResetSNT && <Button color="primary" block onClick={handleReset}>reset allowance</Button>}
    {!shouldResetSNT && <Button color="primary" block onClick={handleApprove}>approve</Button>}

  </Col>
  <Col xs={3} />
  </Row>
</div>;

export default ApproveTokenFunds;
