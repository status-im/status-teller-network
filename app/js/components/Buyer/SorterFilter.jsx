import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faSortAmountDown} from "@fortawesome/free-solid-svg-icons";

import './SorterFilter.scss';

const SorterFilter = () => (
  <div className="sorter-select font-weight-bold px-3 py-2 bg-secondary rounded v-align-center my-3">
    <span className="sort-icon bg-dark text-white rounded-circle d-inline-block text-center p-2 mr-2">
      <FontAwesomeIcon icon={faSortAmountDown}/>
    </span> Sort and filter <span className="float-right pt-1"><FontAwesomeIcon size="2x" icon={faAngleDown}/></span>
  </div>
);

SorterFilter.propTypes = {
  onChange: PropTypes.func
};

export default SorterFilter;
