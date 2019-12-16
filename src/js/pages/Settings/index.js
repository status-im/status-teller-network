import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button} from "reactstrap";
import network from '../../features/network';
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {withTranslation} from "react-i18next";


class Settings extends Component {
  clearCache = () => {
    this.props.clearCache();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  render() {
    const t = this.props.t;
    return (<Fragment>
      <h2 className="mt-3">{t('profileSettings.cacheSettings.title')}</h2>
      <p>{t('profileSettings.cacheSettings.pressToReset')}</p>
      <p>{t('profileSettings.cacheSettings.willDelete')}</p>
      <p>{t('profileSettings.cacheSettings.noPermanentLoss')}</p>
      <Button color="secondary" onClick={this.clearCache}>{t('profileSettings.cacheSettings.resetCache')}</Button>
    </Fragment>);
  }
}

Settings.propTypes = {
  t: PropTypes.func,
  clearCache: PropTypes.func,
  history: PropTypes.object
};

export default connect(
  null,
  {
    clearCache: network.actions.clearCache
  }
)(withRouter(withTranslation()(Settings)));
