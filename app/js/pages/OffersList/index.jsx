import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from "react-router-dom";
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe, faArrowRight} from "@fortawesome/free-solid-svg-icons";

import network from '../../features/network';
import metadata from '../../features/metadata';
import {PAYMENT_METHODS, SORT_TYPES} from '../../features/metadata/constants';
import Offer from '../../components/Offer';
import SorterFilter from './components/SorterFilter';

import './index.scss';

class OffersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenFilter: '',
      paymentMethodFilter: -1,
      sortType: 0
    };
  }

  componentDidMount() {
    this.props.loadOffers();
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

  sortByDate(a, b) {
    // Using the id as there is no date in the contract
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  }

  render() {
    let filteredOffers = this.props.offers;

    if (this.state.paymentMethodFilter !== -1) {
      filteredOffers = filteredOffers.filter((offer) => offer.paymentMethods.includes(this.state.paymentMethodFilter));
    }

    if (this.state.tokenFilter !== '') {
      filteredOffers = filteredOffers.filter((offer) => offer.asset === this.state.tokenFilter);
    }

    // Sort
    // TODO get rating for users
    let sortFunction;
    switch (this.state.sortType) {
      case 0: sortFunction = this.sortByDate; break;
      case 1: sortFunction = this.sortByDate; break;
      default: sortFunction = this.sortByDate;
    }
    filteredOffers = filteredOffers.sort(sortFunction);


    const groupedOffer = filteredOffers.reduce((grouped, offer) => {
      offer.paymentMethods.forEach((paymentMethod) => (
        (grouped[paymentMethod] || (grouped[paymentMethod] = [])).push(offer)
      ));
      return grouped;
    }, {});

    return (
      <Fragment>
        <h2 className="text-center">
          We found {this.props.offers.length} sellers worldwide <FontAwesomeIcon icon={faGlobe}/>
        </h2>

        <SorterFilter paymentMethods={PAYMENT_METHODS}
                      sortTypes={SORT_TYPES}
                      sortType={this.state.sortType}
                      tokens={this.props.tokens}
                      setTokenFilter={this.setTokenFilter}
                      setSortType={this.setSortType}
                      setPaymentMethodFilter={this.setPaymentMethodFilter}
                      tokenFilter={this.state.tokenFilter}
                      paymentMethodFilter={this.state.paymentMethodFilter}/>

        {Object.keys(groupedOffer).map((paymentMethod) => (
          <Fragment key={paymentMethod}>
            <h4 className="clearfix mt-5">
              {PAYMENT_METHODS[paymentMethod]}
              <Button tag={Link}
                      color="link"
                      className="float-right"
                      to="/offers/map">On Map
                      <FontAwesomeIcon className="ml-2" icon={faArrowRight}/>
              </Button>
            </h4>
            {groupedOffer[paymentMethod].map((offer, index) => <Offer key={`${paymentMethod}${index}`} withDetail offer={offer}/>)}
          </Fragment>
        ))}
      </Fragment>
    );
  }
}

OffersList.propTypes = {
  offers: PropTypes.array,
  tokens: PropTypes.array,
  loadOffers: PropTypes.func
};

const mapStateToProps = state => {
  return {
    offers: metadata.selectors.getOffersWithUser(state),
    tokens: Object.values(network.selectors.getTokens(state))
  };
};


export default connect(
  mapStateToProps,
  {
    loadOffers: metadata.actions.loadOffers
  })(OffersList);
