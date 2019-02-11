import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardImg, CardBody,
         CardTitle, CardSubtitle } from 'reactstrap';

const cardBodyStyle = { textAlign: 'center' };
const cardStyle = { border: 'none' };

const Price = (props) => (
  <Card style={cardStyle}>
    <CardImg top width="100%" src={props.logo} alt="Card image cap" />
    <CardBody style={cardBodyStyle}>
      <CardTitle>{props.priceTicker}</CardTitle>
      <CardSubtitle>{props.price}</CardSubtitle>
    </CardBody>
  </Card>
);

Price.propTypes = {
  logo: PropTypes.string,
  price: PropTypes.number,
  priceTicker: PropTypes.string
};

export default Price;
