import React, {Fragment} from 'react';
import {Row, Col, Button} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ArrowDown from "../../../../images/down-arrow.svg";
import TransferIcon from "../../../../images/transfer.svg";
import CheckIcon from "../../../../images/check.svg";
import {Trans, withTranslation} from "react-i18next";

// eslint-disable-next-line complexity
const SendMoney = ({t, isBuyer, isActive, isDone, action, fiatAmount, fiatSymbol, disabled}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" image={TransferIcon} bgColor={isActive ? "primary" : "grey"}/>}
      {isDone && <RoundedIcon size="xs" image={CheckIcon} bgColor="green"/>}
      {!isDone && isActive && <img src={ArrowDown} alt="" className="arrow" />}
    </Col>

    <Col xs={isActive ? '7' : '9'} sm={isActive ? '8' : '9'} md={isActive ? '9' : '9'}>
      <p className={classnames("m-0 font-weight-bold", {'text-primary': isActive, 'text-black': !isActive})}>
        {t('escrow.sendMoney.transferMoney')}
      </p>

      {!isDone && <Fragment>
        <p className="m-0 text-muted text-small">
          {isBuyer && <Trans i18nKey="escrow.sendMoney.pleaseSend" values={{fiatAmount, fiatSymbol}}>
              Please send <span className="font-weight-bold">{{fiatAmount}} {{fiatSymbol}}</span> to the seller through the decided payment method
            </Trans>}
          {!isBuyer && t('escrow.sendMoney.buyerWillSend')}
        </p>
      </Fragment>}

      {isDone && <p className="m-0 text-muted text-small">{t('escrow.sendMoney.moneyTransferred')}</p>}
    </Col>

    <Col xs={isActive ? '4' : '2'} sm={isActive ? '3' : '2'} md={isActive ? '2' : '2'}>
      {!isDone && !isActive && <p className="text-muted text-small">{isBuyer ? t('general.you') : t('general.buyer')}</p>}

      {isActive && !isBuyer && <div className="bg-dark rounded p-2 position-relative">
        <span className="bubble-triangle bg-dark"/>
        <p className="text-white text-small font-weight-bold m-0">{t('escrow.general.buyersTurn')}</p>
        <p className="m-0 text-center">
          <Button onClick={action} className="p-2 text-dark text-small rounded mt-1">
            {t('escrow.sendMoney.markAsReceived')}
          </Button>
        </p>
      </div>}

      {isActive && isBuyer && <div className="bg-primary rounded p-2 position-relative">
        <span className="bubble-triangle bg-primary"/>
        <p className="text-white mb-1 text-small">{t('escrow.general.yourTurn')}</p>
        <p className="m-0 text-center">
          <Button onClick={action} className="p-2 text-primary text-small rounded" disabled={disabled}>
            {t('escrow.sendMoney.markAsPaid')}
          </Button>
        </p>
      </div>}
    </Col>
  </Row>
);

SendMoney.defaultProps = {
  isBuyer: false,
  isActive: false,
  isDone: false
};

SendMoney.propTypes = {
  t: PropTypes.func,
  isBuyer: PropTypes.bool,
  isActive: PropTypes.bool,
  isDone: PropTypes.bool,
  disabled: PropTypes.bool,
  action: PropTypes.func,
  fiatAmount: PropTypes.string,
  fiatSymbol: PropTypes.string
};

export default withTranslation()(SendMoney);
