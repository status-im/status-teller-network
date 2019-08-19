import React from 'react';
import {Link, withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap';

import "./index.scss";
import logo from "../../../images/teller-logo-icon.svg";
import logoText from "../../../images/teller-logo-text.svg";
import betaTag from "../../../images/beta-tag.svg";
import iconProfile from "../../../images/profile.svg";
import iconCloseProfile from "../../../images/close_profile.svg";


const Header = ({location, history}) => (
  <header className="border-bottom">
    <Navbar expand="md" className="px-0">
      <NavbarBrand tag={Link} to="/">
        <img src={logo} alt="Logo" className="mr-2"/><img src={logoText} alt="Logo text"/>
        <img src={betaTag} alt="Beta tag" className="ml-2 mt-1"/>
      </NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          {location.pathname.indexOf('/profile') === -1 && <NavLink tag={Link} to="/profile"><img src={iconProfile} alt="Profile" width="32" height="32" /></NavLink>}
          {location.pathname === '/profile' && <NavLink onClick={() => history.go(-1)}><img src={iconCloseProfile} alt="Home" width="32" height="32" /></NavLink>}
          {location.pathname.indexOf('/profile/') > -1 && <NavLink onClick={() => history.go(-2)}><img src={iconCloseProfile} alt="Home" width="32" height="32" /></NavLink>}
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
