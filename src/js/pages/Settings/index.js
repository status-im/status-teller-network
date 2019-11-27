import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button} from "reactstrap";
import network from '../../features/network';
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";


class Settings extends Component {
  clearCache = () => {
    this.props.clearCache();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  render() {
    return (<Fragment>
      <h2 className="mt-3">Cache settings</h2>
      <p>Press this button to reset your local cache.</p>
      <p>This delete your current cache and up to date data will be loaded.</p>
      <p>None of your data will be permanently lost</p>
      <Button color="secondary" onClick={this.clearCache}>Reset cache</Button>
    </Fragment>);
  }
}

Settings.propTypes = {
  clearCache: PropTypes.func,
  history: PropTypes.object
};

export default connect(
  null,
  {
    clearCache: network.actions.clearCache
  }
)(withRouter(Settings));
