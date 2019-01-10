import React from 'react'
import { connect } from 'react-redux';
import { Card, CardImg, CardBody,
         CardTitle, CardSubtitle } from 'reactstrap';
import { getEthUsdPrice, getSntUsdPrice } from '../features/prices/reducer';

import Price from '../components/Price'

const cardBodyStyle = { textAlign: 'center' }
const cardStyle = { border: 'none' }
const PriceContainer = ({ ethUsd, sntUsd }) => (
  <div>
    <Price logo="https://raw.githubusercontent.com/TrustWallet/tokens/master/coins/60.png" priceTicker="ETH/USD" price={ethUsd} />
    <Price logo="https://raw.githubusercontent.com/TrustWallet/tokens/master/images/0x744d70fdbe2ba4cf95131626614a1763df805b9e.png" priceTicker="SNT/USD" price={sntUsd} />
  </div>
)

const mapStateToProps = state => ({
  ethUsd: getEthUsdPrice(state),
  sntUsd: getSntUsdPrice(state)
})

export default connect(mapStateToProps)(PriceContainer)
