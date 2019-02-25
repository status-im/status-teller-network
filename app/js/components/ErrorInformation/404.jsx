import React from 'react';
import PropTypes from 'prop-types';
import {withRouter, Link} from "react-router-dom";
import {withNamespaces} from "react-i18next";
import {Button} from 'reactstrap';

import errorImage from '../../../images/error.png';
import './index.scss';

const fourOFour = ({t, history}) => (
  <div className="error-information with-tip with-button">
    <img src={errorImage} alt="error image"/>
    <h2 className="mt-5">
      {t('errorInformation.404.title')}
    </h2>
    <p className="text-muted">
      {t('errorInformation.404.tip')}
    </p>
    <p>
      <Button color="primary" onClick={history.goBack} className="mr-4">{t('errorInformation.404.back')}</Button>
      <Button color="primary" tag={Link} to="/">{t('errorInformation.404.home')}</Button>
    </p>
  </div>
);

fourOFour.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object
};

export default withRouter(withNamespaces()(fourOFour));
