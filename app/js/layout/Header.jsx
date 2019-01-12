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
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
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
    const {t} = this.props;

    return (
      <Navbar color="light" light expand="md">
        <NavbarBrand tag={Link} to="/">{t('header.title')}</NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink tag={Link} to="/price">{t('header.prices')}</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/escrows">{t('header.my_escrows')}</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/map">{t('header.map')}</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/signature">Include signatures</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

Header.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(Header);
