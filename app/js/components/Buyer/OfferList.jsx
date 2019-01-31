import React, {Component} from 'react';
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import OfferListing from '../../components/OfferListing';

const IN_PERSON_DATA = [
  {assets: ['ETH', 'SNT'], seller: 'Bob', location: 'Maniwaukee', nbTrades: 5, isPositiveRating: true},
  {assets: ['ETH'], seller: 'Alice', location: 'Chicago, Illinois', nbTrades: 543, isPositiveRating: false},
  {assets: ['ETH', 'DAI'], seller: 'Juliet', location: 'Sydney, Australia', nbTrades: 53, isPositiveRating: true}
];

const DISTANT_DATA = [
  {assets: ['DAI', 'SNT'], seller: 'George', location: 'Berlin, Deutschland', nbTrades: 54, isPositiveRating: false},
  {assets: ['SNT'], seller: 'Allison', location: 'Rio de Janeiro', nbTrades: 2, isPositiveRating: true},
  {assets: ['ETH', 'DAI'], seller: 'Roger', location: 'Paris, France', nbTrades: 76, isPositiveRating: true}
];

class OfferList extends Component {
  render() {
    return (
      <React.Fragment>
        <h2 className="text-center">
          We found {IN_PERSON_DATA.length} sellers worldwide <FontAwesomeIcon icon={faGlobe}/>
        </h2>
        <p>ADD A FILTER HERE</p>
        <h4 className="clearfix mt-2">
          Cash (in person)
          <Button color="link" className="float-right">On Map <FontAwesomeIcon icon={faArrowRight}/></Button>
        </h4>
        {IN_PERSON_DATA.map((data, idx) => <OfferListing key={'listing-' + idx} assets={data.assets}
                                                         seller={data.seller} location={data.location}
                                                         nbTrades={data.nbTrades}
                                                         isPositiveRating={data.isPositiveRating}/>)}

        <h4 className="mt-5 clearfix">
          Bank/card transfer
          <Button color="link" className="float-right">See all <FontAwesomeIcon icon={faArrowRight}/></Button>
        </h4>
        {DISTANT_DATA.map((data, idx) => <OfferListing key={'listing-' + idx} assets={data.assets}
                                                       seller={data.seller} location={data.location}
                                                       nbTrades={data.nbTrades}
                                                       isPositiveRating={data.isPositiveRating}/>)}
      </React.Fragment>
    );
  }
}

OfferList.propTypes = {};


export default OfferList;
