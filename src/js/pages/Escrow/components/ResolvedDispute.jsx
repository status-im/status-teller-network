import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {faTimes, faCheck} from "@fortawesome/free-solid-svg-icons";
import RoundedIcon from "../../../ui/RoundedIcon";
import Reputation from '../../../components/Reputation';
import { States } from '../../../utils/transaction';

const ResolvedDispute = ({winner, trade, isBuyer, rateTransaction, rateStatus}) => (
  <Fragment>
    <RoundedIcon icon={winner ? faCheck : faTimes} bgColor={winner ? 'green' : 'red'}/>
    <h2 className="mt-4">Dispute Resolved</h2>
    <p className="m-0">The dispute was resolved {winner ? 'in your favor' : `in favor of the ${isBuyer ? 'seller' : 'buyer'}`}</p>
    { isBuyer && <Fragment>
      {trade && trade.sellerRating === '0' && <h2 className="mt-4">Rate your trading experience with this user.</h2>}
      <Reputation trade={trade} rateTransaction={(rateStatus !== States.pending && rateStatus !== States.success) ? rateTransaction : null} size="l"/>
    </Fragment> }
  </Fragment>
);

ResolvedDispute.propTypes = {
  trade: PropTypes.object,
  winner: PropTypes.bool,
  isBuyer: PropTypes.bool,
  rateTransaction: PropTypes.func,
  rateStatus: PropTypes.string
};

export default ResolvedDispute;
