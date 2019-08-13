import React from 'react';
import {Link, withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap';

import "./index.scss";
import logo from "../../../images/logo-small.svg";
import iconProfile from "../../../images/profile.svg";
import iconCloseProfile from "../../../images/close_profile.svg";


const Header = ({location, history}) => (
  <header className="border-bottom">
    <Navbar expand="md" className="px-0">
      <NavbarBrand tag={Link} to="/"><img src={logo} alt="Logo" width="32" height="32" /><span className="text-body text-logo">TN</span></NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          {location.pathname.indexOf('/profile') === -1 && <NavLink tag={Link} to="/profile"><img src={iconProfile} alt="Profile" width="32" height="32" /></NavLink>}
          {location.pathname === '/profile' && <a href="#" onClick={() => {history.go(-1)}}><img src={iconCloseProfile} alt="Home" width="32" height="32" /></a>}
          {location.pathname.indexOf('/profile/') > -1 && <a href="#" onClick={() => {history.go(-2)}}><img src={iconCloseProfile} alt="Home" width="32" height="32" /></a>}

        </NavItem>
      </Nav>
    </Navbar>
  </header>
);

Header.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(Header);
