import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Link} from "react-router-dom";
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe, faArrowRight} from "@fortawesome/free-solid-svg-icons";

import metadata from '../../features/metadata';
import {PAYMENT_METHODS} from '../../features/metadata/constants';
import OfferListing from '../../components/OfferListing';
import SorterFilter from '../../components/Buyer/SorterFilter';

import './Listing.scss';

class OfferListContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.props.loadOffers();
  }

  render() {
    const groupedOffer = this.props.offers.reduce((grouped, offer) => {
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
        <SorterFilter/>
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

OfferListContainer.propTypes = {
  offers: PropTypes.array,
  loadOffers: PropTypes.func
};

const mapStateToProps = state => {
  return {
    offers: metadata.selectors.getOffersWithUser(state)
  };
};


export default connect(
  mapStateToProps,
  {
    loadOffers: metadata.actions.loadOffers
  })(OfferListContainer);
