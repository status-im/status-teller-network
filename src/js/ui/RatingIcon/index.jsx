import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';

const RatingIcon = ({isPositiveRating, onClick, isRated}) => (
  <Fragment>
    {isPositiveRating && <FontAwesomeIcon className={classnames({"text-warning": !isRated, "text-success": isRated})} icon={faThumbsUp} onClick={onClick} />}
    {!isPositiveRating && <FontAwesomeIcon className={classnames({"text-warning": !isRated, "text-success": isRated})} icon={faThumbsDown} onClick={onClick} />}
  </Fragment>
);

RatingIcon.propTypes = {
  isPositiveRating: PropTypes.bool,
  isRated: PropTypes.bool,
  onClick: PropTypes.func
};

export default RatingIcon;
