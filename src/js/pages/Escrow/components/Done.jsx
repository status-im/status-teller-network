import React from 'react';
import {Row, Col} from 'reactstrap';
import RoundedIcon from "../../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import Reputation from "../../../components/Reputation";
import {States} from '../../../utils/transaction';
import CheckIcon from "../../../../images/check.svg";
import RatingIcon from "../../../ui/RatingIcon";
import classnames from 'classnames';
import {withTranslation} from "react-i18next";

// eslint-disable-next-line complexity
const Done = ({t, isDone, hadDispute, isBuyer, isActive, trade, rateSellerStatus, rateBuyerStatus, rateTransaction}) => {
  const rating = trade ? parseInt(isBuyer ? trade.sellerRating : trade.buyerRating, 10) : 0;
  const tradeWasRated = trade && rating !== 0 && !trade.rateLoading;

  return (
  <Row className="mt-4">
    <Col xs="1">
      {!isDone && <RoundedIcon size="xs" image={CheckIcon} bgColor="grey"/>}
      {isDone && <RoundedIcon size="xs" image={CheckIcon} bgColor="green"/>}
    </Col>

    <Col xs={(isActive || hadDispute) ? '6' : '11'} sm={(isActive || hadDispute) ? '8' : '11'}>
      <p className="m-0 font-weight-bold">
        {t('escrow.done.done')}
      </p>

      {!isDone && <p className="m-0 text-muted text-small">
        {t('escrow.done.finishedWhen')}
      </p>}

      {isDone && <p className="m-0 text-muted text-small">
        {t('escrow.done.isComplete')}
      </p>}
    </Col>
    {(isActive || hadDispute) && <Col xs="5" sm="3">
      <div className={classnames("rounded p-2 position-relative bg-white", {'shadow-sm': !tradeWasRated})}>
        {!trade.rateLoading && !tradeWasRated && <p className="mb-1 text-small text-black">
          {t('escrow.done.howDidItGo')}
        </p>}
        <p className="m-0 text-center">
          {tradeWasRated &&
          <span
            className={classnames("rounded-circle rating-with-action rating-rated float-right mr-3 mt-2 text-center", {
              'bg-success': rating > 3,
              'bg-danger': rating <= 3
            })}>
            <RatingIcon isPositiveRating={rating > 3} isRated={true} size="sm"/>
          </span>
          }
          {!trade.rateLoading && !tradeWasRated && isBuyer &&
          <Reputation trade={trade}
                      rateTransaction={(rateSellerStatus !== States.pending && rateSellerStatus !== States.success) ? rateTransaction : null}
                      size="l"
                      isBuyer={isBuyer}
          />}
          {!trade.rateLoading && !tradeWasRated && !isBuyer &&
          <Reputation trade={trade}
                      rateTransaction={(rateBuyerStatus !== States.pending && rateBuyerStatus !== States.success) ? rateTransaction : null}
                      size="l"
                      isBuyer={isBuyer}
          />}

          {trade.rateLoading && 'Loading...'}
        </p>
      </div>
    </Col>}
  </Row>
  );
};

Done.defaultProps = {
  isDone: false,
  isActive: false,
  isBuyer: false,
  hadDispute: false
};

Done.propTypes = {
  t: PropTypes.func,
  hadDispute: PropTypes.bool,
  isDone: PropTypes.bool,
  isActive: PropTypes.bool,
  isBuyer: PropTypes.bool,
  trade: PropTypes.object,
  rateTransaction: PropTypes.func,
  rateSellerStatus: PropTypes.string,
  rateBuyerStatus: PropTypes.string
};

export default withTranslation()(Done);
