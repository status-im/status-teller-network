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
import {CURRENCY_DATA} from "../../constants/currencies";

class OffersList extends Component {
  constructor(props) {
    super(props);
    this.defaultState = {
      tokenFilter: '',
      paymentMethodFilter: -1,
      amountFilter: -1,
      sortType: 0,
      locationCoords: null,
      calculatingLocation: false,
      showCommunicationMethod: false,
      currency: '',
      contactMethodFilter: ''
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
      return this.setState({calculatingLocation: false, locationCoords: null, location: ''});
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

  changeCurrency= (currency) => {
    if (!currency) {
      currency = '';
    }
    this.setState({currency});
  };

  setAmountFilter= (amountFilter) => {
    if (!amountFilter) {
      amountFilter = -1;
    }
    this.setState({amountFilter});
  };

  setContactMethodFilter= (contactMethodFilter) => {
    if (!contactMethodFilter || contactMethodFilter === this.state.contactMethodFilter) {
      contactMethodFilter = '';
    }
    this.setState({contactMethodFilter});
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
    if (this.state.paymentMethodFilter !== -1) {
      filteredOffers = filteredOffers.filter(offer => offer.paymentMethods.includes(parseInt(this.state.paymentMethodFilter, 10)));
    }
    if (this.state.contactMethodFilter !== '') {
      filteredOffers = filteredOffers.filter(offer => stringToContact(offer.user.contactData).method === this.state.contactMethodFilter);
    }
    if (this.state.currency !== '') {
      filteredOffers = filteredOffers.filter(offer => offer.currency === this.state.currency);
    }
    if (this.state.amountFilter !== -1) {
      filteredOffers = filteredOffers.filter(offer => {
        const limitH = parseFloat(offer.limitH);
        const limitL = parseFloat(offer.limitL);
        return (limitH === 0 || limitH >= this.state.amountFilter) && (limitL === 0 || limitL <= this.state.amountFilter);
      });
    }

    // Sort
    let sortFunction;
    switch (this.state.sortType) {
      case 1: sortFunction = sortByMargin(this.props.tokens.find(x => x.symbol === "SNT").address); break;
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
                        setSortType={this.setSortType}
                        location={this.state.location}
                        setLocation={this.setLocation}
                        setPaymentMethodFilter={this.setPaymentMethodFilter}
                        tokenFilter={this.state.tokenFilter}
                        paymentMethodFilter={this.state.paymentMethodFilter}
                        toggleCommunicationMethod={this.toggleCommunicationMethod}
                        showCommunicationMethod={this.state.showCommunicationMethod}
                        currencies={CURRENCY_DATA.map(x => ({id: x.id, label: `${x.id} - ${x.label}. ${x.symbol}`}))}
                        changeCurrency={this.changeCurrency}
                        selectedCurrency={this.state.currency}
                        amountFilter={Number.parseFloat(this.state.amountFilter)}
                        setAmountFilter={this.setAmountFilter}
                        contactMethodFilter={this.state.contactMethodFilter}
                        setContactMethodFilter={this.setContactMethodFilter}/>
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
