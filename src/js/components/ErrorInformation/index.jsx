import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {withTranslation} from "react-i18next";
import {Button} from 'reactstrap';

import errorImage from '../../../images/error.png';
import './index.scss';

const ErrorInformation = ({t, provider, network, transaction, sntTokenError, retry, message, cancel, customErrorTitle, customErrorTip, cancelText, CTAText}) => (
  <div className={classnames("error-information with-tip mt-5", {'with-button': !!retry})}>
    <img src={errorImage} alt="error"/>
    <h2 className="mt-5">
      {provider && t('errorInformation.provider.title')}
      {network && t('errorInformation.network.title')}
      {transaction && t('errorInformation.transaction.title')}
      {sntTokenError && t('errorInformation.sntTokenError.title')}
      {customErrorTitle}
    </h2>
    {message && <p className="text-muted mb-2">{message}</p>}
    <p className="text-muted mb-2">
      {provider && t('errorInformation.provider.tip')}
      {network && t('errorInformation.network.tip', {network})}
      {transaction && t('errorInformation.transaction.tip')}
      {sntTokenError && t('errorInformation.sntTokenError.tip')}
      {customErrorTip}
    </p>
    <p>
      {cancel && <Button color="secondary" className="mr-3" onClick={cancel}>{cancelText || t('errorInformation.cancel')}</Button>}
      {retry && <Button color="primary" onClick={retry}>{CTAText || t('errorInformation.retry')}</Button>}
    </p>
  </div>
);

ErrorInformation.defaultProps = {
  provider: false,
  network: '',
  transaction: false,
  customErrorTitle: '',
  customErrorTip: '',
  cancelText: '',
  CTAText: ''
};

ErrorInformation.propTypes = {
  t: PropTypes.func,
  provider: PropTypes.bool,
  network: PropTypes.string,
  transaction: PropTypes.bool,
  sntTokenError: PropTypes.bool,
  retry: PropTypes.func,
  message: PropTypes.string,
  cancel: PropTypes.func,
  customErrorTitle: PropTypes.string,
  customErrorTip: PropTypes.string,
  cancelText: PropTypes.string,
  CTAText: PropTypes.string
};

export default withTranslation()(ErrorInformation);
