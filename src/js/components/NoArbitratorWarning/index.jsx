import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {zeroAddress} from '../../utils/address';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {withTranslation} from "react-i18next";

const NoArbitratorWarning = ({t, arbitrator, label}) => <Fragment>
    {arbitrator === zeroAddress && <span className="text-danger text-small pl-2">
    <FontAwesomeIcon className="mr-2" icon={faExclamationTriangle} size="sm"/>
    {label || t('arbitration.noArbitrationLabel')}
  </span>}
</Fragment>;

NoArbitratorWarning.propTypes = {
  t: PropTypes.func,
  arbitrator: PropTypes.string,
  label: PropTypes.string
};

export default withTranslation()(NoArbitratorWarning);
