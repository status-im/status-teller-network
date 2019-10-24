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
    this.props.rateTransaction(this.props.trade.escrowId, rating, this.props.isBuyer);
  }

  /*eslint-disable-next-line complexity */
  render() {
    const {size, rateTransaction, trade, isBuyer, reputation = {}} = this.props;
    const rating = trade ? parseInt(isBuyer ? trade.sellerRating : trade.buyerRating, 10) : 0;
    const tradeWasRated = trade && rating !== 0;
    this.clickable = !tradeWasRated && rateTransaction && trade;

    if (reputation.hasOwnProperty('averageCount')) {
      let classes = 'average-rating py-1 px-3 rounded ';
      if (!Number.isInteger(reputation.averageCount)) {
        classes += 'bg-dark text-dark';
      } else  if (reputation.averageCount >= 8) {
        classes += 'bg-success text-success';
      } else  if (reputation.averageCount < 8 && reputation.averageCount > 4) {
        classes += 'bg-warning text-warning';
      } else  if (reputation.averageCount < 4) {
        classes += 'bg-danger text-danger';
      }

      return <span className={classes}>
        {Number.isInteger(reputation.averageCount) ? reputation.averageCount : 'NA'}
      </span>;
    }

    return <span className={classnames("reputation-container", {small: size === 's', large: size === 'l'})}>
      <span className={classnames("left-rating", {'rounded-circle pt-2 bg-success rating-with-action': this.clickable || tradeWasRated, 'clickable': this.clickable})}>
      {(tradeWasRated && reputation.upCount) || (!trade && reputation.upCount)}
        &nbsp;<RatingIcon isPositiveRating={true} isRated={tradeWasRated && rating === 5} onClick={this.clickable ? () => this.rateTrade('5') : null} size={this.clickable || tradeWasRated ? 'lg' : 'sm'}/>
      </span>
      <span className={classnames("right-rating", {' bg-danger rounded-circle pt-2 rating-with-action': this.clickable || tradeWasRated, 'clickable': this.clickable})}>
      {(tradeWasRated && reputation.downCount) || (!trade && reputation.downCount)}
        &nbsp;<RatingIcon isPositiveRating={false} isRated={tradeWasRated && rating === 1} onClick={this.clickable ? () => this.rateTrade('1') : null} size={this.clickable || tradeWasRated ? 'lg' : 'sm'}/>
      </span>
    </span>;
  }
}

Reputation.propTypes = {
  t: PropTypes.func,
  size: PropTypes.string,
  isBuyer: PropTypes.bool,
  trade: PropTypes.object,
  rateTransaction: PropTypes.func,
  reputation: PropTypes.object
};

export default withNamespaces()(Reputation);
