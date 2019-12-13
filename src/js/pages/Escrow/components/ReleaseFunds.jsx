import React, {Fragment} from 'react';
import {Row, Col, Button} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ArrowDown from "../../../../images/down-arrow.svg";
import UserCheck from "../../../../images/user-check.svg";
import CheckIcon from "../../../../images/check.svg";
import {withTranslation} from "react-i18next";

// eslint-disable-next-line complexity
const ReleaseFunds = ({t, isBuyer, isActive, isDone, action, isPaid, disabled}) => (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" image={UserCheck} bgColor={isActive ? "primary" : "grey"}/>}
      {isDone && <RoundedIcon size="xs" image={CheckIcon} bgColor="green"/>}
      {!isDone && isActive && <img src={ArrowDown} alt="" className="arrow" />}
    </Col>

    <Col xs={isActive ? '7' : '9'} sm={isActive ? '8' : '9'} md={isActive ? '9' : '9'}>
      <p className={classnames("m-0 font-weight-bold", {'text-primary': isActive, 'text-black': !isActive})}>
        {t('escrow.release.confirmPayment')}
      </p>

      {!isDone && <Fragment>
        <p className="m-0 text-muted text-small">
          {isBuyer && t('escrow.release.sellerWillRelease')}
          {!isBuyer && isPaid && t('escrow.release.paymentDone')}
          {!isBuyer && !isPaid && t('escrow.release.waitForBuyerToSend')}
        </p>
      </Fragment>}

      {isDone && <p className="m-0 text-muted text-small">{t('escrow.release.paymentHasBeenConfirmed')}</p>}
    </Col>

    <Col xs={isActive ? '4' : '2'} sm={isActive ? '3' : '2'} md={isActive ? '2' : '2'}>
      {!isDone && !isActive && <p className="text-muted text-small">{isBuyer ? t('general.seller') : t('general.you')}</p>}

      {isActive && isBuyer && <div className="bg-dark rounded p-2 position-relative">
        <span className="bubble-triangle bg-dark"/>
        <p className="text-white text-small font-weight-bold m-0">{t('escrow.general.sellersTurn')}</p>
        <p className="text-white text-mini m-0">{t('escrow.general.noActionNeeded')}</p>
      </div>}

      {isActive && !isBuyer && <div className="bg-primary rounded p-2 position-relative">
        <span className="bubble-triangle bg-primary"/>
        <p className="text-white mb-1 text-small">{t('escrow.general.yourTurn')}</p>
        <p className="m-0 text-center">
          <Button onClick={action} className="p-2 text-primary text-small rounded" disabled={disabled}>
            {t('escrow.release.releaseFunds')}
          </Button>
        </p>
      </div>}
    </Col>
  </Row>
);

ReleaseFunds.defaultProps = {
  isBuyer: false,
  isActive: false,
  isDone: false,
  isPaid: false
};

ReleaseFunds.propTypes = {
  t: PropTypes.func,
  isBuyer: PropTypes.bool,
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  isDone: PropTypes.bool,
  isPaid: PropTypes.bool,
  action: PropTypes.func
};

export default withTranslation()(ReleaseFunds);
