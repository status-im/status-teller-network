import React, {Fragment} from 'react';
import {Row, Col, Button} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {ReactComponent as ApproveIcon} from "../../../../images/pencil.svg";
import ArrowDown from "../../../../images/down-arrow.svg";
import CheckIcon from "../../../../images/check.svg";
import {withTranslation} from "react-i18next";

const ApproveTokenRow = ({t, isActive, isDone, action, tokenAmount, tokenSymbol, enoughBalance, disabled}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" imageComponent={ApproveIcon} bgColor="primary" className="white-icon"/>}
      {!isDone && <img src={ArrowDown} alt="" className="arrow"/>}
      {isDone && <RoundedIcon size="xs" image={CheckIcon} bgColor="green"/>}
    </Col>

    <Col xs={isActive ? '7' : '9'} sm={isActive ? '8' : '9'} md={isActive ? '9' : '9'}>
      <p className={classnames("m-0 font-weight-bold", {'text-primary': isActive, 'text-black': !isActive})}>
        {t('escrow.approving.title')}
      </p>

      {!isDone && <Fragment>
        <p className="m-0 text-muted text-small">
          {t('escrow.approving.needToApprove', {tokenAmount, tokenSymbol})}
        </p>
        {!enoughBalance && <p className="m-0 text-small text-danger">{t('escrow.funding.notEnoughBalance')}</p>}
      </Fragment>}

      {isDone && <p className="m-0 text-muted text-small">{t('escrow.approving.approved')}</p>}
    </Col>

    <Col xs={isActive ? '4' : '2'} sm={isActive ? '3' : '2'} md={isActive ? '2' : '2'}>
      {isActive && <div className="bg-primary rounded p-2 position-relative">
        <span className="bubble-triangle bg-primary"/>
        <p className="text-white mb-1 text-small">{t('escrow.general.yourTurn')}</p>
        <p className="m-0 text-center">
          <Button onClick={action} className="p-2 text-primary text-small rounded"
                  disabled={!enoughBalance || disabled}>
            {t('escrow.approving.approveTransfer')}
          </Button>
        </p>
      </div>}
    </Col>
  </Row>
);

ApproveTokenRow.defaultProps = {
  isActive: false,
  isDone: false,
  enoughBalance: true
};

ApproveTokenRow.propTypes = {
  t: PropTypes.func,
  isActive: PropTypes.bool,
  isDone: PropTypes.bool,
  enoughBalance: PropTypes.bool,
  disabled: PropTypes.bool,
  action: PropTypes.func,
  tokenAmount: PropTypes.string,
  tokenSymbol: PropTypes.string
};

export default withTranslation()(ApproveTokenRow);
