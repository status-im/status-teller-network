import React from 'react';
import {Link, withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {Navbar, NavbarBrand, Nav, NavLink, NavItem, Button, Row, Col} from 'reactstrap';
import classnames from 'classnames';
import {withTranslation} from "react-i18next";

import logoWhite from "../../../images/teller-logo-white.svg";
import iconProfile from "../../../images/profile.svg";
import iconCloseProfile from "../../../images/close_profile.svg";

import "./index.scss";

const Header = ({t, location, history}) => {
  if (location.pathname === '/') {
    // Not this header on the landing page
    return null;
  }
  const isProfile = location.pathname === '/profile';

  return (
    <header className={classnames("app-header", {'in-profile': isProfile})}>
      <Navbar expand="md">
        <Row noGutters>
          <Col xs={1}>
            {!isProfile && <NavbarBrand tag={Link} to="/buy">
              <img src={logoWhite} alt="Logo"/>
            </NavbarBrand>}
          </Col>

          <Col xs={10}>
            {!isProfile && <Nav className="header-nav-btns">
              <Button tag={Link} to="/buy" size="sm" className={classnames("mr-3", {active: location.pathname === '/buy'})}>
                {t('header.buy')}
              </Button>
              <Button tag={Link} to="/sell" size="sm" className={classnames({active: location.pathname.indexOf('/sell/') > -1})}>
                {t('header.sell')}
              </Button>
            </Nav>}
          </Col>

          <Col xs={1}>
            <Nav className="hamburger-nav" navbar>
              <NavItem>
                {!isProfile &&
                <NavLink tag={Link} to="/profile">
                  <img src={iconProfile} alt="Profile" width="32" height="32"/>
                </NavLink>}

                {isProfile &&
                <NavLink onClick={() => history.go(-1)}>
                  <img src={iconCloseProfile} alt="Home" width="32" height="32"/>
                </NavLink>}
              </NavItem>
            </Nav>
          </Col>
        </Row>
      </Navbar>
    </header>
  );
};

Header.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(withTranslation()(Header));
