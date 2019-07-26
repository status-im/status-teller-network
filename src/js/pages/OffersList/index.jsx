import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from "react-router-dom";
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe, faArrowRight} from "@fortawesome/free-solid-svg-icons";

import network from '../../features/network';
import metadata from '../../features/metadata';
import prices from '../../features/prices';
import {getLocation} from '../../services/googleMap';
import {PAYMENT_METHODS, SORT_TYPES} from '../../features/metadata/constants';
import Offer from '../../components/Offer';
import SorterFilter from './components/SorterFilter';
import Loading from '../../components/Loading';
import {sortByDate, sortByRating} from '../../utils/sorters';
import './index.scss';
import {withNamespaces} from "react-i18next";
import {addressCompare, zeroAddress} from "../../utils/address";
import {checkNotEnoughETH, filterValidGaslessOffers} from "../../utils/transaction";

class OffersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenFilter: '',
      paymentMethodFilter: -1,
      sortType: 0,
      locationCoords: null,
      calculatingLocation: false
    };
  }

  componentDidMount() {
    this.props.loadOffers();
    this.props.updateBalance('ETH');
  }

  setPaymentMethodFilter = (paymentMethodFilter) => {
    if (this.state.paymentMethodFilter === paymentMethodFilter) {
      paymentMethodFilter = -1;
    }
    this.setState({paymentMethodFilter});
  };

  setTokenFilter = (selected) => {
    let tokenFilter = '';
    if (selected[0]) {
      tokenFilter = selected[0].value;
    }
    this.setState({tokenFilter});
  };

  setSortType = (sortType) => {
    if (this.state.sortType === sortType) {
      sortType = 0;
    }
    this.setState({sortType});
  };

  setLocation = (location) => {
    if (!location) {
      return this.setState({calculatingLocation: false, locationCoords: null});
    }
    if (location === this.state.location) {
      return;
    }

    this.setState({calculatingLocation: true});
    getLocation(location).then(coords => {
      this.setState({
        calculatingLocation: false,
        locationCoords: coords,
        location
      });
    }).catch(e => {
      this.setState({
        calculatingLocation: false,
        error: e.message,
        location
      });
    });
  };

  calculateDistance = (userCoords) => {
    return Math.sqrt(Math.pow(userCoords.lat - this.state.locationCoords.lat, 2) + Math.pow(userCoords.lng - this.state.locationCoords.lng, 2));
  };

  render() {
    const notEnoughETH = checkNotEnoughETH(this.props.gasPrice, this.props.ethBalance);
    let filteredOffers = filterValidGaslessOffers(this.props.offers, notEnoughETH).filter(x => !addressCompare(x.arbitrator, zeroAddress));

    if (this.state.locationCoords) {
      filteredOffers = filteredOffers.filter((offer) =>  this.calculateDistance(offer.user.coords) < 0.25);
    }

    if (this.state.tokenFilter !== '') {
      filteredOffers = filteredOffers.filter(offer => addressCompare(offer.asset, this.state.tokenFilter));
    }

    let groupedOffers = filteredOffers.reduce((grouped, offer) => {
      offer.paymentMethods.forEach((paymentMethod) => (
        (grouped[paymentMethod] || (grouped[paymentMethod] = [])).push(offer)
      ));
      return grouped;
    }, {});

    // Sort
    let sortFunction;
    switch (this.state.sortType) {
      case 1: sortFunction = sortByDate; break;
      default: sortFunction = sortByRating;
    }
    Object.keys(groupedOffers).forEach(key => {
      groupedOffers[key].sort(sortFunction);
    });

    let groupedOffersByUser = {};
    let sellers = {};
    Object.keys(groupedOffers).forEach(paymentMethod => {
      if (this.state.paymentMethodFilter !== -1 && paymentMethod.toString() !== this.state.paymentMethodFilter.toString()) {
        return;
      }
      const offersForMethod = groupedOffers[paymentMethod];
      groupedOffersByUser[paymentMethod] = offersForMethod.reduce((grouped, offer) => {
        sellers[offer.owner] = true;
        if (!grouped[offer.owner]) {
          grouped[offer.owner] = [];
        }
        grouped[offer.owner].push(offer);
        return grouped;
      }, {});
    });

    return (
      <Fragment>
        <div>
          <h2 className="d-inline-block pt-2">{this.props.t('offers.listTitle')}</h2>
          <SorterFilter paymentMethods={PAYMENT_METHODS}
                        sortTypes={SORT_TYPES}
                        sortType={this.state.sortType}
                        tokens={this.props.tokens}
                        setTokenFilter={this.setTokenFilter}
                        setSortType={this.setSortType}
                        setLocation={this.setLocation}
                        setPaymentMethodFilter={this.setPaymentMethodFilter}
                        tokenFilter={this.state.tokenFilter}
                        paymentMethodFilter={this.state.paymentMethodFilter}/>
        </div>

        { notEnoughETH && <p>Other assets are hidden until you have ETH in your wallet</p>}

        {this.state.calculatingLocation && <Loading value={this.props.t('offers.locationLoading')}/>}

        {Object.keys(groupedOffersByUser).map((paymentMethod) => (
          <Fragment key={paymentMethod}>
            <h4 className="clearfix mt-5">
              {PAYMENT_METHODS[paymentMethod]}
              <Button tag={Link}
                      color="link"
                      className="float-right p-0"
                      to="/offers/map">On Map
                <FontAwesomeIcon className="ml-2" icon={faArrowRight}/>
              </Button>
            </h4>
            {Object.keys(groupedOffersByUser[paymentMethod]).map((owner, index) => <Offer
              key={`${paymentMethod}${index}`} withDetail offers={groupedOffersByUser[paymentMethod][owner]}
              prices={this.props.prices} userAddress={this.props.address}/>)}
          </Fragment>
        ))}
      </Fragment>
    );
  }
}

OffersList.propTypes = {
  t: PropTypes.func,
  offers: PropTypes.array,
  tokens: PropTypes.array,
  loadOffers: PropTypes.func,
  prices: PropTypes.object,
  address: PropTypes.string,
  gasPrice: PropTypes.string,
  updateBalance: PropTypes.func,
  ethBalance: PropTypes.string
};

const mapStateToProps = state => {
  return {
    address: network.selectors.getAddress(state) || '',
    offers: metadata.selectors.getOffersWithUser(state),
    tokens: Object.values(network.selectors.getTokens(state)),
    prices: prices.selectors.getPrices(state),
    gasPrice: network.selectors.getNetworkGasPrice(state),
    ethBalance: network.selectors.getBalance(state, 'ETH')
  };
};


export default connect(
  mapStateToProps,
  {
    loadOffers: metadata.actions.loadOffers,
    updateBalance: network.actions.updateBalance
  })(withNamespaces()(OffersList));
