import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Link} from "react-router-dom";
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe, faArrowRight} from "@fortawesome/free-solid-svg-icons";

import metadata from '../../features/metadata';
import OfferListing from '../../components/OfferListing';
import SorterFilter from '../../components/Buyer/SorterFilter';

import './Listing.scss';

class OfferListContainer extends Component {
  componentDidMount() {
    this.props.loadOffers();
  }

  render() {
    return (
      <React.Fragment>
        <h2 className="text-center">
          We found {this.props.offers.length} sellers worldwide <FontAwesomeIcon icon={faGlobe}/>
        </h2>
        <SorterFilter/>
        <h4 className="clearfix mt-2">
          Cash (in person)
          <Button tag={Link} color="link" className="float-right" to="/buy/map">On Map <FontAwesomeIcon
            icon={faArrowRight}/></Button>
        </h4>
        {this.props.offers.map((data, idx) => <OfferListing key={'listing-' + idx}
                                                            assets={[data.asset]}
                                                            owner={data.owner}
                                                            location={data.location}
                                                            nbTrades={data.nbTrades}
                                                            positiveRatings={data.positiveRatings}
                                                            negativeRating={data.negativeRatings}/>)}

        <h4 className="mt-5 clearfix">
          Bank/card transfer
          <Button tag={Link} color="link" className="float-right" to="/buy/list">See all <FontAwesomeIcon
            icon={faArrowRight}/></Button>
        </h4>
        {this.props.offers.map((data, idx) => <OfferListing key={'listing-' + idx}
                                                            assets={[data.asset]}
                                                            owner={data.owner}
                                                            location={data.location}
                                                            nbTrades={data.nbTrades}
                                                            positiveRatings={data.positiveRatings}
                                                            negativeRating={data.negativeRatings}/>)}
      </React.Fragment>
    );
  }
}

OfferListContainer.propTypes = {
  offers: PropTypes.array,
  loadOffers: PropTypes.func
};

const mapStateToProps = state => {
  return {
    offers: metadata.selectors.getOffers(state)
  };
};


export default connect(
  mapStateToProps,
  {
    loadOffers: metadata.actions.loadOffers
  })(OfferListContainer);
