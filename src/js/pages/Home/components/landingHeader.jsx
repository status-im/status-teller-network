import React from 'react';
import {Link} from "react-router-dom";
import {Navbar, Nav, NavItem} from 'reactstrap';
import PropTypes from "prop-types";

import logo from "../../../../images/teller-logo-icon.svg";
import logoText from "../../../../images/teller-logo-text.svg";
import OpenDappBtn from "./openDappBtn";

const LandingHeader = ({loading}) => (
  <header className="p-l-0 pr-0">
    <Navbar expand="md" className="px-0">
      <Link to="/">
        <img src={logo} alt="Logo" className="mr-2"/><img src={logoText} alt="Logo text"/>
      </Link>
      <Nav className="ml-auto" navbar>
        <NavItem>
          <OpenDappBtn loading={loading} size="sm"/>
        </NavItem>
      </Nav>
    </Navbar>
  </header>
);

LandingHeader.propTypes = {
  loading: PropTypes.bool
};

export default LandingHeader;
