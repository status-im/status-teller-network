import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";

const RatingIcon = ({isPositiveRating, onClick}) => (
  <Fragment>
    {isPositiveRating && <FontAwesomeIcon className="text-warning" icon={faThumbsUp} onClick={onClick} />}
    {!isPositiveRating && <FontAwesomeIcon className="text-warning" icon={faThumbsDown} onClick={onClick} />}
  </Fragment>
);

RatingIcon.propTypes = {
  isPositiveRating: PropTypes.bool,
  onClick: PropTypes.func
};

export default RatingIcon;
