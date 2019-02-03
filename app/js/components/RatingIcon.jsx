import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";

const RatingIcon = ({isPositiveRating}) => (
  <Fragment>
    {isPositiveRating && <FontAwesomeIcon className="text-warning" icon={faThumbsUp}/>}
    {!isPositiveRating && <FontAwesomeIcon className="text-warning" icon={faThumbsDown}/>}
  </Fragment>
);

RatingIcon.propTypes = {
  isPositiveRating: PropTypes.bool
};

export default RatingIcon;
