import React from 'react';
import {Button} from 'reactstrap';
import PropTypes from "prop-types";

import {withNamespaces} from "react-i18next";
import {Link} from "react-router-dom";

const OpenDappBtn = ({t, loading, size, text, aos}) => (
  <Button size={size} tag={Link} disabled={loading} color="primary" to="/buy" className="d-inline-block mx-auto" data-aos={aos}>
    {!loading ? text || t('home.openDapp') : t('home.loadingData')}
  </Button>
);

OpenDappBtn.propTypes = {
  t: PropTypes.func,
  loading: PropTypes.bool,
  size: PropTypes.string,
  text: PropTypes.string,
  aos: PropTypes.string
};

export default withNamespaces()(OpenDappBtn);
