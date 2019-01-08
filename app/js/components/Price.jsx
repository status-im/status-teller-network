import React from 'react';
import { Card, CardImg, CardBody,
         CardTitle, CardSubtitle } from 'reactstrap';

const cardBodyStyle = { textAlign: 'center' }
const cardStyle = { border: 'none' }

const Price = (props) => (
  <Card style={cardStyle}>
    <CardImg top width="100%" src={props.logo} alt="Card image cap" />
    <CardBody style={cardBodyStyle}>
      <CardTitle>{props.priceTicker}</CardTitle>
      <CardSubtitle>{props.price}</CardSubtitle>
    </CardBody>
  </Card>
);

export default Price;
