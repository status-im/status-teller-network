import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {faTimes, faCheck} from "@fortawesome/free-solid-svg-icons";
import RoundedIcon from "../../../ui/RoundedIcon";

const ResolvedDispute = ({winner}) => (
  <Fragment>
    <RoundedIcon icon={winner ? faCheck : faTimes} bgColor={winner ? 'green' : 'red'}/>
    <h2 className="mt-4">Dispute Resolved</h2>
    <p className="m-0">The dispute was resolved and you are the {winner ? 'winner' : 'loser'}</p>
  </Fragment>
);

ResolvedDispute.propTypes = {
  winner: PropTypes.bool
};

export default ResolvedDispute;
