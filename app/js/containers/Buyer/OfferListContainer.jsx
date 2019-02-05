import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import OfferListing from '../../components/OfferListing';
import SorterFilter from '../../components/Buyer/SorterFilter';

import './Listing.scss';

const IN_PERSON_DATA = [
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Bob', location: 'Maniwaukee', nbTrades: 5, positiveRatings: 43, negativeRatings: 23},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Alice', location: 'Chicago, Illinois', nbTrades: 543, positiveRatings: 43, negativeRatings: 23},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Juliet', location: 'Sydney, Australia', nbTrades: 53, positiveRatings: 43, negativeRatings: 23}
];

const DISTANT_DATA = [
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'George', location: 'Berlin, Deutschland', nbTrades: 54, positiveRatings: 43, negativeRatings: 23},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Allison', location: 'Rio de Janeiro', nbTrades: 2, positiveRatings: 43, negativeRatings: 23},
  {assets: [{name: 'ETH', price: 123}, {name: 'SNT', price: 3}], seller: 'Roger', location: 'Paris, France', nbTrades: 76, positiveRatings: 43, negativeRatings: 23}
];

class OfferListContainer extends Component {
  render() {
    return (
      <React.Fragment>
        <h2 className="text-center">
          We found {IN_PERSON_DATA.length} sellers worldwide <FontAwesomeIcon icon={faGlobe}/>
        </h2>
        <SorterFilter/>
        <h4 className="clearfix mt-2">
          Cash (in person)
          <Button tag={Link} color="link" className="float-right" to="/buy/map">On Map <FontAwesomeIcon
            icon={faArrowRight}/></Button>
        </h4>
        {IN_PERSON_DATA.map((data, idx) => <OfferListing key={'listing-' + idx} assets={data.assets}
                                                         seller={data.seller} location={data.location}
                                                         nbTrades={data.nbTrades}
                                                         positiveRatings={data.positiveRatings}
                                                         negativeRating={data.negativeRatings}/>)}

        <h4 className="mt-5 clearfix">
          Bank/card transfer
          <Button tag={Link} color="link" className="float-right" to="/buy/list">See all <FontAwesomeIcon
            icon={faArrowRight}/></Button>
        </h4>
        {DISTANT_DATA.map((data, idx) => <OfferListing key={'listing-' + idx} assets={data.assets}
                                                       seller={data.seller} location={data.location}
                                                       nbTrades={data.nbTrades}
                                                       positiveRatings={data.positiveRatings}
                                                       negativeRating={data.negativeRatings}/>)}
      </React.Fragment>
    );
  }
}

export default OfferListContainer;
