import React, { Component } from 'react';
import { Link } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
 } from 'reactstrap';

class Header extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <Navbar color="light" light expand="md">
        <NavbarBrand tag={Link} to="/">Status Teller Network</NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink tag={Link} to="/price">Prices</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/escrows">My Escrows</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/map">Map</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/signature">Include signatures</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/arbitration">Arbitration</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default Header
