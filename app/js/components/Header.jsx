import React from 'react';
import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye} from "@fortawesome/free-solid-svg-icons";
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap';

const Header = (_props) => (
  <header>
    <Navbar expand="md">
      <NavbarBrand tag={Link} to="/"><FontAwesomeIcon icon={faBullseye} class="mr-2"/>TN</NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          <NavLink tag={Link} to="/profile/">Profile</NavLink>
        </NavItem>
      </Nav>
    </Navbar>
  </header>
);

export default Header;
