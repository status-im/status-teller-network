import React from 'react';
import {Button} from 'reactstrap';

import './index.scss';
import {withTranslation} from "react-i18next";
import PropTypes from "prop-types";

const LoadingButton = ({t}) => (
  <Button color="primary" className="loading-button-spinner">
    <div className="spinner-border text-light" role="status">
      <span className="sr-only">{t('general.loading')}</span>
    </div>
  </Button>
);

LoadingButton.propTypes = {
  t: PropTypes.func
};

export default withTranslation()(LoadingButton);
