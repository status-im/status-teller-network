import {Button} from "reactstrap";
import PropTypes from "prop-types";
import React from "react";
import {withTranslation} from "react-i18next";

const ClearButton = ({t, onClear, close}) => (
  <Button onClick={() => {
    if (onClear) {
      onClear();
    }
    close();
  }} className="px-2 py-0 clear-button clickable">{t('filter.clearSelection')}</Button>
);

ClearButton.propTypes = {
  t: PropTypes.func,
  onClear: PropTypes.func,
  close: PropTypes.func
};

export default withTranslation()(ClearButton);
