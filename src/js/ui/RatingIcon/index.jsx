import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';

const RatingIcon = ({isPositiveRating, onClick, isRated, size}) => (
  <Fragment>
    {isPositiveRating && <FontAwesomeIcon size={size} className={classnames({"text-warning": !onClick && !isRated, "text-primary": isRated, "text-success": onClick && !isRated})} icon={faThumbsUp} onClick={onClick} />}
    {!isPositiveRating && <FontAwesomeIcon size={size} className={classnames({"text-warning": !onClick && !isRated, "text-primary": isRated, "text-danger": onClick && !isRated})} icon={faThumbsDown} onClick={onClick} />}
  </Fragment>
);

RatingIcon.propTypes = {
  isPositiveRating: PropTypes.bool,
  isRated: PropTypes.bool,
  onClick: PropTypes.func,
  size: PropTypes.string
};

export default RatingIcon;
