/* eslint-disable no-confusing-arrow, multiline-ternary */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import classnames from "classnames";

import RatingIcon from "../../ui/RatingIcon";

import './index.scss';

class Reputation extends Component {
  render() {
    const {size, rateTransaction, trade, reputation} = this.props;
    const tradeWasRated = trade && trade.rating !== "0";
    const onClick = rating => tradeWasRated || !rateTransaction || !trade
                              ? () => {}
                              : () => { rateTransaction(trade.escrowId, rating); };

    return <span className={classnames("reputation-container", {small: size === 's', large: size === 'l'})}>
      <span className="left-rating bg-secondary">
      {(tradeWasRated && reputation.upCount) || (!trade && reputation.upCount)} <RatingIcon isPositiveRating={true} onClick={onClick('5')} />
      </span>
      <span className="right-rating bg-secondary">
      {(tradeWasRated && reputation.downCount) || (!trade && reputation.downCount)} <RatingIcon isPositiveRating={false} onClick={onClick('1')} />
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
