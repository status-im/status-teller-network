/* global web3 */
import React from 'react';
import {Row, Col, Button} from "reactstrap";
import PropTypes from 'prop-types';

const ApproveTokenFunds = ({token, requiredToken, tokenAllowance, shouldResetToken, handleApprove, handleReset}) => <div>
  <Row>
    <Col>
      <h4>{shouldResetToken ? 'Reset ' + token.symbol + ' token Allowance' : 'Approve  ' + token.symbol + ' token'}</h4>
      {!shouldResetToken && <p>You authorize the contract to transfer {web3.utils.fromWei(requiredToken, "ether")} {token.symbol} on your behalf. This can only occur when you approve a transation to authorize the transfer</p>}
      {shouldResetToken && <p>Your {token.symbol} allowance for this contract ({web3.utils.fromWei(tokenAllowance, "ether")} {token.symbol}) is less than the required ({web3.utils.fromWei(requiredToken, "ether")} {token.symbol}). Reset your {token.symbol} allowance before approving the required amount</p>}
    </Col>
  </Row>
  <Row className="mt-4">
  <Col xs={3} />
  <Col xs={6}>
    {shouldResetToken && <Button color="primary" block onClick={handleReset}>Reset allowance</Button>}
    {!shouldResetToken && <Button color="primary" block onClick={handleApprove}>Approve</Button>}

  </Col>
  <Col xs={3} />
  </Row>
</div>;

ApproveTokenFunds.propTypes = {
  token: PropTypes.object,
  requiredToken: PropTypes.string,
  tokenAllowance: PropTypes.string,
  shouldResetToken: PropTypes.bool,
  handleApprove: PropTypes.func,
  handleReset: PropTypes.func
};

export default ApproveTokenFunds;
