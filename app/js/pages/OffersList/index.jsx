import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from "react-router-dom";
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe, faArrowRight} from "@fortawesome/free-solid-svg-icons";

import network from '../../features/network';
import metadata from '../../features/metadata';
import {PAYMENT_METHODS} from '../../features/metadata/constants';
import OfferListing from '../../components/OfferListing';
import SorterFilter from './components/SorterFilter';

import './Listing.scss';

class OffersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenFilter: '',
      paymentMethodFilter: -1
    };
  }

  componentDidMount() {
    this.props.loadOffers();
  }

  setPaymentMethodFilter = (paymentMethodFilter) => {
    this.setState({paymentMethodFilter});
  }

  setTokenFilter = (selected) => {
    let tokenFilter = '';
    if (selected[0]) {
      tokenFilter = selected[0].value;
    }
    this.setState({tokenFilter});
  }

  render() {
    let filteredOffer = this.props.offers;

    if (this.state.paymentMethodFilter !== -1) {
      filteredOffer = filteredOffer.filter((offer) => offer.paymentMethods.includes(this.state.paymentMethodFilter));
    }

    if (this.state.tokenFilter !== '') {
      filteredOffer = filteredOffer.filter((offer) => offer.asset === this.state.tokenFilter);
    }

    const groupedOffer = filteredOffer.reduce((grouped, offer) => {
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
                      tokens={this.props.tokens}
                      setTokenFilter={this.setTokenFilter}
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
                      to="/buy/map">On Map
                      <FontAwesomeIcon icon={faArrowRight}/>
              </Button>
            </h4>
            {groupedOffer[paymentMethod].map((offer, index) => <OfferListing key={`${paymentMethod}${index}`} offer={offer}/>)}
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
