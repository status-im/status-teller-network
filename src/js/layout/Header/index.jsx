import React from 'react';
import {Link, withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap';

import "./index.scss";
import logo from "../../../images/logo-small.svg";
import iconProfile from "../../../images/profile.svg";
import iconCloseProfile from "../../../images/close_profile.svg";


const Header = ({profile, location}) => (
  <header className="border-bottom">
    <Navbar expand="md" className="px-0">
      <NavbarBrand tag={Link} to="/"><img src={logo} alt="Logo" width="32" height="32" /><span className="text-body text-logo">TN</span></NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          {profile && location.pathname !== '/profile' && <NavLink tag={Link} to="/profile"><img src={iconProfile} alt="Profile" width="20" height="16" /></NavLink>}
          {profile && location.pathname === '/profile' && <NavLink tag={Link} to="/"><img src={iconCloseProfile} alt="Home" width="32" height="32" /></NavLink>}
        </NavItem>
      </Nav>
    </Navbar>
  </header>
);

Header.propTypes = {
  history: PropTypes.object,
  profile: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(Header);
