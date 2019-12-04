import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from "prop-types";
import {withNamespaces} from "react-i18next";

import logo from "../../../../images/teller-logo-icon.svg";
import statusLogo from "../../../../images/landing/statusLogo.svg";
import logoText from "../../../../images/teller-logo-text.svg";
import betaTag from "../../../../images/beta-tag.svg";
import {Link} from "react-router-dom";

const LandingFooter = () => (
  <footer className="landing-footer border-top pt-5 mt-5" data-aos="fade-up">
    <Row>
      <Col xs={6} md={3}>
        <img src={logo} alt="Logo" className="mr-2"/><img src={logoText} alt="Logo text"/>
        <img src={betaTag} alt="Beta tag" className="ml-2 mt-1"/>
      </Col>

      <Col xs={6} md={3}>
        <h5>Documentation</h5>
        <ul>
          <li><Link to="offer/list">Getting Started</Link></li>
          <li><Link to="offer/list">Another Link</Link></li>
          <li><Link to="offer/list">Another Link</Link></li>
        </ul>
      </Col>

      <Col xs={6} md={3}>
        <h5>Status Network</h5>
        <ul>
          <li><a target="_blank" href="https://status.im">Status</a></li>
          <li><a target="_blank" href="https://embark.status.im">Embark</a></li>
          <li><a target="_blank" href="https://keycard.status.im">Keycard</a></li>
          <li><a target="_blank" href="https://nimbus.status.im">Nimbus</a></li>
        </ul>
      </Col>

      <Col xs={6} md={3}>
        <p className="text-right home-details mb-1">We are part of</p>
        <p className="text-right">
          <a target="_blank" href="https://status.im"><img src={statusLogo} alt="Logo"/></a>
        </p>
      </Col>
    </Row>

    <p className="text-center mb-1 home-details">© 2019 Teller, Inc. All rights reserved</p>
    <p className="text-center home-details">Privacy Policy TODO ADD LINK</p>
  </footer>
);

LandingFooter.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(LandingFooter);
