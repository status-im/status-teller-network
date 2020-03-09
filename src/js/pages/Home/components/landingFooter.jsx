import React from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";

import logo from "../../../../images/teller-logo-icon.svg";
import statusLogo from "../../../../images/landing/statusLogo.svg";
import logoText from "../../../../images/teller-logo-text.svg";
import betaTag from "../../../../images/beta-tag.svg";
import githubIcon from "../../../../images/landing/github-icon.png";
import twitterIcon from "../../../../images/landing/twitter-icon.svg";
import statusIcon from "../../../../images/landing/status-icon.svg";

const LandingFooter = ({t}) => (
  <footer className="landing-footer border-top pt-5 mt-5" data-aos="fade-up">
    <Row>
      <Col xs={6} md={3} className="order-first mb-4 pb-5">
        <img src={logo} alt="Logo" className="mr-2"/><img src={logoText} alt="Logo text"/>
        <img src={betaTag} alt="Beta tag" className="ml-2 mt-1"/>
      </Col>

      <Col xs={6} md={3} className="order-1 order-md-0">
        <h5>{t('home.footer.socialLinks')}</h5>
        <ul>
          <li><a target="_blank" rel="noopener noreferrer" href="https://statusnetwork.com/">
            <img src={statusIcon} alt="status icon" width={35} height={35} className="mr-2"/> Status
          </a></li>
          <li className="mt-3"><a target="_blank" rel="noopener noreferrer" href="https://twitter.com/TellerExchange">
            <img src={twitterIcon} alt="twitter icon" width={35} height={35} className="mr-2"/> Twitter
          </a></li>
          <li className="mt-3"><a target="_blank" rel="noopener noreferrer" href="https://github.com/status-im/status-teller-network">
            <img src={githubIcon} alt="github icon" width={35} height={35} className="mr-2"/> Github
          </a></li>
        </ul>
      </Col>

      <Col xs={6} md={3} className="order-2 order-md-1">
        <h5>Status Network</h5>
        <ul>
          <li><a target="_blank" rel="noopener noreferrer" href="https://status.im">Status</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://keycard.status.im">Keycard</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://dap.ps/">dap.ps</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://assemble.fund/">Assemble</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://embark.status.im">Embark</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://subspace.embarklabs.io/">Subspace</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://vac.dev/">Vac</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://nimbus.status.im">Nimbus</a></li>
        </ul>
      </Col>

      <Col xs={6} md={3} className="order-0 order-md-2">
        <p className="text-right home-details mb-1">{t('home.footer.weArePartOf')}</p>
        <p className="text-right">
          <a target="_blank" rel="noopener noreferrer" href="https://status.im"><img src={statusLogo} alt="Logo"/></a>
        </p>
      </Col>
    </Row>

    <p className="text-center mb-1 home-details">© 2019 Teller, Inc. {t('home.footer.allRightReserved')}</p>
    <p className="text-center home-details">{t('home.footer.privacyPolicy')} TODO ADD LINK</p>
  </footer>
);

LandingFooter.propTypes = {
  t: PropTypes.func
};

export default withTranslation()(LandingFooter);
