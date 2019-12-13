import React from 'react';
import {Button} from 'reactstrap';
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";

const NoLicense = ({t, arbitratorPage}) => (
  <div className="no-license mt-5 px-3">
    <h3>
      {arbitratorPage && t('license.noArbiLicense')}
      {!arbitratorPage && t('license.noSellerLicense')}
    </h3>
    {arbitratorPage &&
    <p className="text-muted">{t('license.onceArbi')}</p>}
    {!arbitratorPage && <p className="text-muted">{t('license.onceSeller')}</p>}
    <p className="mt-5 text-center">
      {arbitratorPage && <Button color="primary" tag={Link} to="/arbitrator/license">{t('license.becomeArbi')}</Button>}
      {!arbitratorPage && <Button color="primary" tag={Link} to="/license">{t('license.becomeSeller')}</Button>}
    </p>
  </div>
);

NoLicense.defaultProps = {
  arbitratorPage: false
};

NoLicense.propTypes = {
  t: PropTypes.func,
  arbitratorPage: PropTypes.bool
};

export default withTranslation()(NoLicense);
