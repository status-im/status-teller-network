import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {withNamespaces} from "react-i18next";
import {Button} from 'reactstrap';

import errorImage from '../../../images/error.png';
import './ErrorInformation.scss';

const ErrorInformation = ({t, provider, network, transaction, retry}) => (
  <div className={classnames("error-information with-tip", {'with-button': !!retry})}>
    <img src={errorImage} alt="error image"/>
    <h2 className="mt-5">
      {provider && t('errorInformation.provider.title')}
      {network && t('errorInformation.network.title')}
      {transaction && t('errorInformation.transaction.title')}
    </h2>
    <p className="text-muted">
      {provider && t('errorInformation.provider.tip')}
      {network && t('errorInformation.network.tip')}
      {transaction && t('errorInformation.transaction.tip')}
    </p>
    {retry && <p>
      <Button color="primary" onClick={retry}>{t('errorInformation.retry')}</Button>
    </p>}
  </div>
);

ErrorInformation.defaultProps = {
  provider: false,
  network: false,
  transaction: false
};

ErrorInformation.propTypes = {
  t: PropTypes.func,
  provider: PropTypes.bool,
  network: PropTypes.bool,
  transaction: PropTypes.bool,
  retry: PropTypes.func
};

export default withNamespaces()(ErrorInformation);
