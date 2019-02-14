import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye} from "@fortawesome/free-solid-svg-icons";
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap';

const Header = ({profile}) => (
  <header>
    <Navbar expand="md" className="px-0">
      <NavbarBrand tag={Link} to="/"><FontAwesomeIcon icon={faBullseye} className="mr-2"/>TN</NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          {profile.username && <NavLink tag={Link} to="/profile/">Profile</NavLink>}
        </NavItem>
      </Nav>
    </Navbar>
  </header>
);

Header.propTypes = {
  profile: PropTypes.object
};

export default Header;
