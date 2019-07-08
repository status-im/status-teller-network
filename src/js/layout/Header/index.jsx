import React from 'react';
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap';

import "./index.scss";
import logo from "../../../images/logo-small.svg";


const Header = ({profile}) => (
  <header className="border-bottom">
    <Navbar expand="md" className="px-0">
      <NavbarBrand tag={Link} to="/"><img src={logo} alt="Logo" width="32" height="32" /><span className="text-body text-logo">TN</span></NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          {profile && <NavLink tag={Link} to="/profile">Profile</NavLink>}
        </NavItem>
      </Nav>
    </Navbar>
  </header>
);

Header.propTypes = {
  history: PropTypes.object,
  profile: PropTypes.object
};

export default Header;
