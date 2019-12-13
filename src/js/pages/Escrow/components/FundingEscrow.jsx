import React, {Fragment} from 'react';
import {Row, Col, Button, UncontrolledTooltip} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import FundIcon from "../../../../images/download.svg";
import classnames from 'classnames';
import ArrowDown from "../../../../images/down-arrow.svg";
import CheckIcon from "../../../../images/check.svg";
import {withTranslation} from "react-i18next";

// eslint-disable-next-line complexity
const FundingEscrow = ({t, isBuyer, isActive, isDone, needsApproval, action, tokenAmount, tokenSymbol, feePercent, feeAmount, enoughBalance, disabled}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" image={FundIcon} bgColor="primary"/>}
      {isDone && <RoundedIcon size="xs" image={CheckIcon} bgColor="green"/>}
      {!isDone && <img src={ArrowDown} alt="" className="arrow" />}
    </Col>

    <Col xs={isActive ? '7' : '9'} sm={isActive ? '8' : '9'} md={isActive ? '9' : '9'}>
      <p className={classnames("m-0 font-weight-bold", {'text-primary': isActive, 'text-black': !isActive})}>
      {t('escrow.funding.fundingEscrow')}
      </p>

      {!isDone && <Fragment>
        <p className="m-0 text-muted text-small">
          {isBuyer ? t('escrow.funding.waitingForSeller') : t('escrow.funding.needToFund')}
        </p>
        {!isBuyer && <Fragment>
          <p className="m-0 text-muted text-small">
            {t('escrow.funding.fundingDetails', {tokenAmount, tokenSymbol, feePercent, feeAmount})}
          </p>
          {!enoughBalance && <p className="m-0 text-small text-danger">{t('escrow.funding.notEnoughBalance')}</p>}
        </Fragment>}
      </Fragment>}

      {isDone && <p className="m-0 text-muted text-small">{t('escrow.funding.tokensFunded')}</p>}
    </Col>

    <Col xs={isActive ? '4' : '2'} sm={isActive ? '3' : '2'} md={isActive ? '2' : '2'}>

      {isActive && isBuyer && <div className="bg-dark rounded p-2 position-relative">
        <span className="bubble-triangle bg-dark"/>
        <p className="text-white text-small font-weight-bold m-0">{t('escrow.general.sellersTurn')}</p>
        <p className="text-white text-mini m-0">{t('escrow.general.noActionNeeded')}</p>
      </div>}

      {isActive && !isBuyer && <div className="bg-primary rounded p-2 position-relative">
        <span className="bubble-triangle bg-primary"/>
        <p className="text-white mb-1 text-small">{t('escrow.general.yourTurn')}</p>
        <p className="m-0 text-center">
          <Button id="fund-escrow-btn" onClick={action} className="p-2 text-primary text-small rounded"
                  disabled={!enoughBalance || disabled}>
            {needsApproval ? t('escrow.funding.approveTransfer') : t('escrow.funding.fundEscrow')}
          </Button>
          {needsApproval && <UncontrolledTooltip placement="left" target="fund-escrow-btn">
            {t('escrow.funding.youNeedToApprove')}
            {t('escrow.funding.doNotWorry')}
          </UncontrolledTooltip>}
        </p>
      </div>}
    </Col>
  </Row>
);

FundingEscrow.defaultProps = {
  isBuyer: false,
  isActive: false,
  isDone: false,
  needsApproval: false,
  enoughBalance: true
};

FundingEscrow.propTypes = {
  t: PropTypes.func,
  isBuyer: PropTypes.bool,
  isActive: PropTypes.bool,
  needsApproval: PropTypes.bool,
  isDone: PropTypes.bool,
  enoughBalance: PropTypes.bool,
  disabled: PropTypes.bool,
  action: PropTypes.func,
  tokenAmount: PropTypes.string,
  tokenSymbol: PropTypes.string,
  feePercent: PropTypes.string,
  feeAmount: PropTypes.string
};

export default withTranslation()(FundingEscrow);
