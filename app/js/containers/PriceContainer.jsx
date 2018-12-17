import React from 'react'
import { connect } from 'react-redux';
import { Card, CardImg, CardBody,
         CardTitle, CardSubtitle } from 'reactstrap';
import { getEthUsdPrice, getSntUsdPrice } from '../features/prices/reducer';


const cardBodyStyle = { textAlign: 'center' }
const cardStyle = { border: 'none' }
const PriceContainer = ({ ethUsd, sntUsd }) => (
  <div>
    <Card style={cardStyle}>
      <CardImg top width="100%" src="https://raw.githubusercontent.com/TrustWallet/tokens/master/coins/60.png" alt="Card image cap" />
      <CardBody style={cardBodyStyle}>
        <CardTitle>ETH/USD</CardTitle>
        <CardSubtitle>{ethUsd}</CardSubtitle>
      </CardBody>
    </Card>
    <Card style={cardStyle}>
      <CardImg top width="100%" src="https://raw.githubusercontent.com/TrustWallet/tokens/master/images/0x744d70fdbe2ba4cf95131626614a1763df805b9e.png" alt="Card image cap" />
      <CardBody style={cardBodyStyle}>
        <CardTitle>SNT/USD</CardTitle>
        <CardSubtitle>{sntUsd}</CardSubtitle>
      </CardBody>
    </Card>
  </div>
)

const mapStateToProps = state => ({
  ethUsd: getEthUsdPrice(state),
  sntUsd: getSntUsdPrice(state)
})

export default connect(mapStateToProps)(PriceContainer)
