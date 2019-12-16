/* global web3 */
import React from 'react';
import {Row, Col, Button} from "reactstrap";
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";

const ApproveTokenFunds = ({t, token, requiredToken, tokenAllowance, shouldResetToken, handleApprove, handleReset}) => <div>
  <Row>
    <Col>
      <h4>{shouldResetToken ? t('escrow.approve.reset', {tokenSymbol: token.symbol}) : t('escrow.approve.approveToken', {tokenSymbol: token.symbol})}</h4>
      {!shouldResetToken &&
      <p>
        {t('escrow.approve.authorize', {amount: web3.utils.fromWei(requiredToken, "ether"), tokenSymbol: token.symbol})}
      </p>}
      {shouldResetToken && <p>
        {t('escrow.approve.shouldReset', {
          tokenSymbol: token.symbol,
          allowance: web3.utils.fromWei(tokenAllowance, "ether"),
          requiredToken: web3.utils.fromWei(requiredToken, "ether")
        })}
      </p>}
    </Col>
  </Row>
  <Row className="mt-4">
  <Col xs={3} />
  <Col xs={6}>
    {shouldResetToken && <Button color="primary" block onClick={handleReset}>{t('escrow.approve.resetAllowance')}</Button>}
    {!shouldResetToken && <Button color="primary" block onClick={handleApprove}>{t('escrow.approve.approve')}</Button>}

  </Col>
  <Col xs={3} />
  </Row>
</div>;

ApproveTokenFunds.propTypes = {
  t: PropTypes.func,
  token: PropTypes.object,
  requiredToken: PropTypes.string,
  tokenAllowance: PropTypes.string,
  shouldResetToken: PropTypes.bool,
  handleApprove: PropTypes.func,
  handleReset: PropTypes.func
};

export default withTranslation()(ApproveTokenFunds);
