import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye} from "@fortawesome/free-solid-svg-icons";
import {Navbar, NavbarBrand, Nav, NavLink, NavItem, Collapse} from 'reactstrap';

const Header = (_props) => (
  <header>
    <Navbar expand="md">
      <NavbarBrand href="/"><FontAwesomeIcon icon={faBullseye}/> TN</NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          <NavLink href="/profile/">Profile</NavLink>
        </NavItem>
      </Nav>
    </Navbar>
  </header>
);

Header.propTypes = {
  // goToProfile: PropTypes.func
};

export default Header;
