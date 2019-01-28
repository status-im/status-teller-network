import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye} from "@fortawesome/free-solid-svg-icons";
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap';

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

export default Header;
