import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {faTimes, faCheck} from "@fortawesome/free-solid-svg-icons";
import RoundedIcon from "../../../ui/RoundedIcon";

const ResolvedDispute = ({winner, isBuyer}) => (
  <Fragment>
    <RoundedIcon icon={winner ? faCheck : faTimes} bgColor={winner ? 'green' : 'red'}/>
    <h2 className="mt-4">Dispute Resolved</h2>
    <p className="m-0">The dispute was resolved {winner ? 'in your favor' : `in favor of the ${isBuyer ? 'seller' : 'buyer'}`}</p>
  </Fragment>
);

ResolvedDispute.propTypes = {
  winner: PropTypes.bool,
  isBuyer: PropTypes.bool
};

export default ResolvedDispute;
