import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import Offer from './Offer';

const Offers = ({offers, onClick}) => (
  <Row>
    <Col xs="12" className="mt-2">
      <h3>Offers</h3>
      <div>
        {offers.map((offer, index) => <Offer key={index}
                                             offer={offer}
                                             onClick={() => onClick(offer.id)}/>)}
      </div>
    </Col>
  </Row>
);

Offers.propTypes = {
  offers: PropTypes.array,
  onClick: PropTypes.func
};

export default Offers;
