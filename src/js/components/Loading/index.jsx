import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {withNamespaces} from "react-i18next";

import "./index.scss";

const Loading = ({t, mining, initial, page, value}) => (
  <div className="loading" style={{"textAlign": "center"}}>
    <h3 className="mb-4">
      {value}
      {mining && t('loading.mining')}
      {initial && t('loading.initial')}
      {page && t('loading.page')}
    </h3>
    <FontAwesomeIcon icon={faCircleNotch} size="5x" spin/>
  </div>
);

Loading.propTypes = {
  t: PropTypes.func,
  mining: PropTypes.bool,
  initial: PropTypes.bool,
  page: PropTypes.bool,
  value: PropTypes.string
};

export default withNamespaces()(Loading);
