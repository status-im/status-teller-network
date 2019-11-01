import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Row, Col, ModalHeader, ModalBody, Modal} from 'reactstrap';
import { withNamespaces } from 'react-i18next';

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import Draggable from 'react-draggable';
import AOS from 'aos';

import network from "../../features/network";
import metadata from "../../features/metadata";
import prices from "../../features/prices";
import arbitrator from "../../features/arbitration";
import newSeller from "../../features/newSeller";
import newBuy from "../../features/newBuy";
import IconGroup from './components/iconGroup';
import OpenDappBtn from './components/openDappBtn';

import secureIcon from '../../../images/landing/secureIcon.svg';
import peerIcon from '../../../images/landing/peerIcon.svg';
import permissionlessIcon from '../../../images/landing/permissionlessIcon.svg';
import tradeIcon from '../../../images/landing/tradeIcon.svg';
import worldwideIcon from '../../../images/landing/worldwideIcon.svg';
import mostPopularIcon from '../../../images/landing/mostPopularIcon.svg';
import escrowExample from '../../../images/landing/escrowExample.png';

import LandingHeader from "./components/landingHeader";
import LandingFooter from "./components/landingFooter";
import Offer from "../../components/Offer";
import {withRouter} from "react-router-dom";
import {sortByRating} from "../../utils/sorters";

import "./index.scss";
import 'aos/dist/aos.css';

class Home extends Component {
  constructor(props) {
    super(props);
    AOS.init();
  }
  state = {
    warningModalOpened: true,
    bigScreen: this.isBigScreen()
  };

  isBigScreen() {
    return window.innerWidth  > 768;
  }

  componentDidMount() {
    // Watch for window resize for the slider
    window.onresize = (_event) => {
      if (this.state.bigScreen !== this.isBigScreen()) {
        this.setState({bigScreen: this.isBigScreen()});
      }
    };

    if (!this.props.isEip1102Enabled) {
      return;
    }
    this.props.checkIsArbitrator();
    this.props.resetNewOfferData();
    this.props.resetNewBuy();
  }

  componentWillUnmount() {
    window.onresize = null;
  }

  toggleWarningModal = () => {
    this.setState({warningModalOpened: !this.state.warningModalOpened});
    this.props.setMainnetWarningShowed();
  };

  render() {
    const {hasPrices, t, priceError, networkId, mainnetWarningShowed, offers, prices, address} = this.props;

    const loading = !hasPrices && !priceError;

    return (
      <div className="home px-4">
        <LandingHeader loading={!hasPrices && !priceError}/>
        <div className="home-headline-container">
          <Row className="home-headline">
            <Col xs={12}>
              <h1 className="text-center font-weight-bold"
                  data-aos="fade-up">{t('home.welcome1')}<br/>{t('home.welcome2')}</h1>
              <h3 className="text-center home-details font-weight-normal mt-2"
                  data-aos="fade-up">{t('home.details')}</h3>
            </Col>
            <Col xs={12} className="text-center mt-3" data-aos="fade-up">
              <OpenDappBtn loading={loading}/>
            </Col>
          </Row>
        </div>

        <Row className="mt-4 mb-3">
          <IconGroup src={secureIcon} title="Secure & Private" aos="fade-right">
            Security is our top priority – connect, chat, and transact with peers using secure technology.
          </IconGroup>
          <IconGroup src={peerIcon} title="Peer to Peer" aos="fade-left">
            You own your funds, you manage your transactions – no unnecessary middle men.
          </IconGroup>
          <IconGroup src={worldwideIcon} title="Worldwide" aos="fade-right">
            Obtain and transact in whatever currency you choose no matter where you are in the world.
          </IconGroup>
          <IconGroup src={permissionlessIcon} title="Permissionless" className="mb-2" aos="fade-left">
            Join anonymously and begin transacting instantly - with anyone and everyone.
          </IconGroup>

          {offers.length > 0 &&
          <IconGroup src={mostPopularIcon} title="Most popular offers" className="mt-5 mb-2" fullSize aos="fade-up">
            <Fragment>
              <p data-aos="fade-up">Choose from a growing number of sellers</p>
              <Draggable
                axis="x"
                handle=".popular-offers"
                defaultPosition={{x: 0, y: 0}}
                position={null}
                grid={[25, 25]}
                bounds={this.state.bigScreen ? {left: -300, right: 300} : {left: -1120, right: 0}}
                scale={1}>
                <div className="popular-offers mb-3" data-aos="fade-up">
                  {offers.sort(sortByRating).slice(0, 5).map((offer, index) => (
                    <Offer key={`offer-${index}`}
                           withDetail offer={offer}
                           prices={prices} userAddress={address}
                           offerClick={() => this.props.history.push('/buy')}/>)
                  )}
                </div>
              </Draggable>
              <OpenDappBtn loading={loading} text={t('home.viewOffers')} aos="fade-up"/>
            </Fragment>
          </IconGroup>}

          <IconGroup src={tradeIcon} title="How does the trade work?" fullSize className="mt-5" aos="fade-up">
            <p data-aos="fade-up">Teller offers a decentralized, safe and private solution.</p>
            <img alt="trade example" src={escrowExample} className="mx-auto mt-2 mb-5 d-block" data-aos="fade-up"/>
            <OpenDappBtn loading={loading} data-aos="fade-up"/>
          </IconGroup>
        </Row>

        <LandingFooter/>

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
  history: PropTypes.object,
  checkIsArbitrator: PropTypes.func,
  isArbitrator: PropTypes.bool,
  offers: PropTypes.array,
  isEip1102Enabled: PropTypes.bool,
  profile: PropTypes.object,
  prices: PropTypes.object,
  hasPrices: PropTypes.bool,
  address: PropTypes.string,
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
    offers: metadata.selectors.getOffersWithUser(state),
    profile: metadata.selectors.getProfile(state, address),
    hasPrices: prices.selectors.hasPrices(state),
    prices: prices.selectors.getPrices(state),
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
)(withNamespaces()(withRouter(Home)));
