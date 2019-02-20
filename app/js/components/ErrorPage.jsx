import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {withNamespaces} from "react-i18next";
import {Button} from 'reactstrap';

import errorImage from '../../images/error.png';
import './ErrorPage.scss';

const ErrorPage = ({t, error, tip, canRepeat}) => (
  <div className={classnames("error-page", {'with-tip': !!tip, 'with-button': !!canRepeat})}>
    <img src={errorImage} alt="error image"/>
    <h2 className="mt-5">{error}</h2>
    <p className="text-muted">{tip}</p>
    {canRepeat && <p>
      <Button color="primary" onClick={() => window.location.reload(false)}>{t('errorPage.repeat')}</Button>
    </p>}
  </div>
);

ErrorPage.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string.isRequired,
  tip: PropTypes.string,
  canRepeat: PropTypes.bool
};

export default withNamespaces()(ErrorPage);
