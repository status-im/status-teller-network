import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";

import "./Loading.scss";

const Loading = () => (
  <div className="loading text-center">
    <h3 className="mb-4">Waiting for the confirmation from miners</h3>
    <FontAwesomeIcon icon={faCircleNotch} size="5x" spin/>
  </div>
);

export default Loading;
