import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Col, Row} from "reactstrap";
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
    return (<Row>
      <Col xs="8" className="v-align-center text-right">
        <Button color="secondary" onClick={this.clearCache}>Reset cache</Button>
      </Col>
    </Row>);
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
