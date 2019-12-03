import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import network from '../../features/network';
import metadata from '../../features/metadata';
import prices from '../../features/prices';
import {getLocation} from '../../services/googleMap';
import {SORT_TYPES} from '../../features/metadata/constants';
import Offer from '../../components/Offer';
import SorterFilter from './components/SorterFilter';
import Loading from '../../components/Loading';
import {sortByRating, sortByMargin} from '../../utils/sorters';
import './index.scss';
import {withNamespaces} from "react-i18next";
import {addressCompare, zeroAddress} from "../../utils/address";
import {checkNotEnoughETH, filterValidGaslessOffers} from "../../utils/transaction";
import newBuy from "../../features/newBuy";
import {withRouter} from "react-router-dom";
import {stringToContact} from "../../utils/strings";

class OffersList extends Component {
  constructor(props) {
    super(props);
    this.defaultState = {
      tokenFilter: '',
      commFilter: '',
      paymentMethodFilter: -1,
      sortType: 0,
      locationCoords: null,
      calculatingLocation: false,
      showCommunicationMethod: false
    };
    this.state = this.defaultState;
  }

  componentDidMount() {
    this.load();
    this.props.resetNewBuy();
  }

  load() {
    this.props.updateBalance('ETH');
  }

  offerClick = (offerId) => {
    const offer = this.props.offers.find(x => x.id === offerId);
    if(addressCompare(offer.owner, this.props.address)){
      this.props.history.push('/profile/offers');
    } else {
      this.props.setOfferId(offerId);
      this.props.history.push('/buy/trade');
    }
  };

  clearFilters = () => {
    this.setState(this.defaultState);
  };

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

  setCommFilter = (selected) => {
    let commFilter = '';
    if (selected[0]) {
      commFilter = selected[0];
    }
    this.setState({commFilter});
  };

  setSortType = (sortType) => {
    if (this.state.sortType === sortType) {
      sortType = 0;
    }
    this.setState({sortType});
  };

  toggleCommunicationMethod = () => {
    this.setState({showCommunicationMethod: !this.state.showCommunicationMethod});
  };

  setLocation = (location) => {
    if (!location) {
      return this.setState({calculatingLocation: false, locationCoords: null});
    }
    if (location === this.state.location) {
      return;
    }

    this.setState({calculatingLocation: true});
    getLocation(location).then(({location: coords}) => {
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
    let hasFilter = false;
    const notEnoughETH = checkNotEnoughETH(this.props.gasPrice, this.props.ethBalance);
    let filteredOffers = filterValidGaslessOffers(this.props.offers, notEnoughETH).filter(x => !addressCompare(x.arbitrator, zeroAddress));

    if (this.state.locationCoords) {
      hasFilter = true;
      filteredOffers = filteredOffers.filter((offer) =>  this.calculateDistance(offer.user.coords) < 0.25);
    }

    if (this.state.tokenFilter !== '') {
      hasFilter = true;
      filteredOffers = filteredOffers.filter(offer => addressCompare(offer.asset, this.state.tokenFilter));
    }
    if (this.state.paymentMethodFilter !== -1) {
      hasFilter = true;
      filteredOffers = filteredOffers.filter(offer => offer.paymentMethods.includes(parseInt(this.state.paymentMethodFilter, 10)));
    }
    if (this.state.commFilter !== '') {
      hasFilter = true;
      filteredOffers = filteredOffers.filter(offer => {
        return stringToContact(offer.user.contactData).method === this.state.commFilter;
      });
    }

    // Sort
    let sortFunction;
    switch (this.state.sortType) {
      case 1: sortFunction = sortByMargin(this.props.tokens.find(x => x.symbol === "SNT").address);
        hasFilter = true; break;
      default: sortFunction = sortByRating;
    }
    filteredOffers.sort(sortFunction);

    return (
      <Fragment>
        <div>
          <SorterFilter sortTypes={SORT_TYPES}
                        sortType={this.state.sortType}
                        tokens={this.props.tokens}
                        clear={this.clearFilters}
                        setTokenFilter={this.setTokenFilter}
                        setCommFilter={this.setCommFilter}
                        setSortType={this.setSortType}
                        setLocation={this.setLocation}
                        setPaymentMethodFilter={this.setPaymentMethodFilter}
                        tokenFilter={this.state.tokenFilter}
                        commFilter={this.state.commFilter}
                        paymentMethodFilter={this.state.paymentMethodFilter}
                        toggleCommunicationMethod={this.toggleCommunicationMethod}
                        showCommunicationMethod={this.state.showCommunicationMethod}
                        hasFilter={hasFilter}/>
        </div>

        {notEnoughETH && <p>Other assets are hidden until you have ETH in your wallet</p>}

        {this.state.calculatingLocation && <Loading value={this.props.t('offers.locationLoading')}/>}

        <div className="mt-4">
          {filteredOffers.length === 0 && this.props.t('offers.noOpen')}
          {filteredOffers.map((offer, index) => (
            <Offer key={`offer-${index}`}
                   withDetail offer={offer}
                   prices={this.props.prices} userAddress={this.props.address}
                   showCommunicationMethod={this.state.showCommunicationMethod}
                   offerClick={this.offerClick}/>)
          )}
        </div>
      </Fragment>
    );
  }
}

OffersList.propTypes = {
  t: PropTypes.func,
  resetNewBuy: PropTypes.func,
  offers: PropTypes.array,
  tokens: PropTypes.array,
  prices: PropTypes.object,
  address: PropTypes.string,
  gasPrice: PropTypes.string,
  updateBalance: PropTypes.func,
  setOfferId: PropTypes.func,
  ethBalance: PropTypes.string,
  history: PropTypes.object
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
    resetNewBuy: newBuy.actions.resetNewBuy,
    updateBalance: network.actions.updateBalance,
    setOfferId: newBuy.actions.setOfferId
  })(withNamespaces()(withRouter(OffersList)));
