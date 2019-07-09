import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {zeroAddress} from '../../utils/address';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";

const NoArbitratorWarning = ({arbitrator, label}) => <Fragment>
    {arbitrator === zeroAddress && <span className="text-danger text-small pl-2">
    <FontAwesomeIcon className="mr-2" icon={faExclamationTriangle} size="sm"/>
    {label}
  </span>}
</Fragment>;

NoArbitratorWarning.defaultProps = {
  label: "No arbitrator found. Disputes cannot be opened"
};

NoArbitratorWarning.propTypes = {
  arbitrator: PropTypes.string,
  label: PropTypes.string
};

export default NoArbitratorWarning;