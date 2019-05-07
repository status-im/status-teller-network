/* eslint-disable no-confusing-arrow */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import classnames from "classnames";

import RatingIcon from "../../ui/RatingIcon";

import './index.scss';

class Reputation extends Component {
  rateTrade(rating) {
    if (!this.clickable) {
      return;
    }
    this.props.rateTransaction(this.props.trade.escrowId, rating);
  }

  render() {
    const {size, rateTransaction, trade, reputation = {}} = this.props;
    const rating = trade ? parseInt(trade.rating, 10) : 0;
    const tradeWasRated = trade && rating !== 0;
    this.clickable = !tradeWasRated && rateTransaction && trade;

    return <span className={classnames("reputation-container", {small: size === 's', large: size === 'l'})}>
      <span className={classnames("left-rating", {
        "bg-secondary": !tradeWasRated || rating !== 5,
        "bg-primary": tradeWasRated && rating === 5,
        clickable: this.clickable
      })}>
      {(tradeWasRated && reputation.upCount) || (!trade && reputation.upCount)}
        &nbsp;<RatingIcon isPositiveRating={true} onClick={() => this.rateTrade('5')}/>
      </span>
      <span className={classnames("right-rating", {
        "bg-secondary": !tradeWasRated || rating !== 1,
        "bg-primary": tradeWasRated && rating === 1,
        clickable: this.clickable
      })}>
      {(tradeWasRated && reputation.downCount) || (!trade && reputation.downCount)}
        &nbsp;<RatingIcon isPositiveRating={false} onClick={() => this.rateTrade('1')}/>
      </span>
    </span>;
  }
}

Reputation.propTypes = {
  t: PropTypes.func,
  size: PropTypes.string,
  trade: PropTypes.object,
  rateTransaction: PropTypes.func,
  reputation: PropTypes.object
};

export default withNamespaces()(Reputation);
