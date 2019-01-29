import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, NavLink, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import {withNamespaces} from 'react-i18next';

class ProfileContainer extends Component {
  render() {
    const t = this.props.t;
    return (
      <Fragment>
        <p>Profile</p>
      </Fragment>
    );
  }
}

ProfileContainer.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(ProfileContainer);
