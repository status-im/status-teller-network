import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Row, Col, Button, ModalHeader, ModalBody, Modal} from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";

import network from "../../features/network";
import metadata from "../../features/metadata";
import prices from "../../features/prices";
import arbitrator from "../../features/arbitration";
import newSeller from "../../features/newSeller";
import newBuy from "../../features/newBuy";

import { version } from '../../../../package.json';

import "./index.scss";

class Home extends Component {
  state = {
    warningModalOpened: true
  };

  componentDidMount() {
    if (!this.props.isEip1102Enabled) {
      return;
    }
    this.props.checkIsArbitrator();
    this.props.resetNewOfferData();
    this.props.resetNewBuy();
  }

  sellUrl() {
    return '/sell';
  }

  toggleWarningModal = () => {
    this.setState({warningModalOpened: !this.state.warningModalOpened});
    this.props.setMainnetWarningShowed();
  };

  render() {
    const {hasPrices, t, priceError, networkId, mainnetWarningShowed} = this.props;

    return (
      <div className="home">
        <Row className="home-headline">
          <Col xs={12}>
            <h1 className="text-center font-weight-bold">{t('home.welcome')}</h1>
            <h3 className="text-center home-details font-weight-normal">{t('home.details')}</h3>
          </Col>
        </Row>

        <Row className="home--footer">
          <Col xs={12} className="text-center">
            <Button tag={Link} disabled={!hasPrices && !priceError} color="primary" to="/offers/list" className="d-block mx-auto">
              {hasPrices || priceError ? t('home.buy') : t('home.loadingData')}
            </Button>

            <Button tag={Link} color="secondary" to={this.sellUrl()} className="d-block mx-auto mt-2">
              {t('home.createOffer')}
            </Button>
          </Col>
        </Row>
        <p className="teller-version text-muted"><Link to="/settings">Settings</Link> | Version: {version}</p>

        {<Modal isOpen={networkId === 1 &&  !mainnetWarningShowed && this.state.warningModalOpened} toggle={this.toggleWarningModal}>
          <ModalHeader toggle={this.toggleWarningModal}>
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2"/>
          Warning: You are on Ethereum&apos;s mainnet
          </ModalHeader>
          <ModalBody>
            <p>This is a short disclaimer to warn you that the contracts used in this Dapp are not audited yet.</p>
            <p>Make sure to keep that in mind before transacting meaningful amounts of money.</p>
            <p>Thank you for using Teller</p>
          </ModalBody>
        </Modal>}
      </div>
    );
  }
}

Home.propTypes = {
  t: PropTypes.func,
  checkIsArbitrator: PropTypes.func,
  isArbitrator: PropTypes.bool,
  isEip1102Enabled: PropTypes.bool,
  profile: PropTypes.object,
  hasPrices: PropTypes.bool,
  priceError: PropTypes.bool,
  resetNewOfferData: PropTypes.func,
  resetNewBuy: PropTypes.func,
  setMainnetWarningShowed: PropTypes.func,
  mainnetWarningShowed: PropTypes.bool,
  networkId: PropTypes.number
};


const mapStateToProps = (state) => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    isArbitrator: arbitrator.selectors.isLicenseOwner(state),
    profile: metadata.selectors.getProfile(state, address),
    hasPrices: prices.selectors.hasPrices(state),
    priceError: prices.selectors.error(state),
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state),
    networkId: network.selectors.getNetwork(state).id,
    mainnetWarningShowed: metadata.selectors.mainnetWarningShowed(state)
  };
};

export default connect(
  mapStateToProps,
  {
    checkIsArbitrator: arbitrator.actions.checkLicenseOwner,
    resetNewOfferData: newSeller.actions.resetNewOfferData,
    resetNewBuy: newBuy.actions.resetNewBuy,
    setMainnetWarningShowed: metadata.actions.setMainnetWarningShowed
  }
)(withNamespaces()(Home));
