import React from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import RatingIcon from "./RatingIcon";
import classnames from "classnames";

import './Reputation.scss';

const Reputation = ({reputation, size}) => (
  <span className={classnames("reputation-container", {small: size === 's', large: size === 'l'})}>
    <span className="left-rating bg-secondary">
      {reputation.upCount} <RatingIcon isPositiveRating={true}/>
    </span>
    <span className="right-rating bg-secondary">
      {reputation.downCount} <RatingIcon isPositiveRating={false}/>
    </span>
  </span>
);

Reputation.propTypes = {
  t: PropTypes.func,
  reputation: PropTypes.object,
  size: PropTypes.string

};

export default withNamespaces()(Reputation);
