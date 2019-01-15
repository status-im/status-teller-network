import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getEthUsdPrice, getSntUsdPrice } from '../features/prices/reducer';

import Price from '../components/Price';

const PriceContainer = ({ ethUsd, sntUsd }) => (
  <div>
    <Price logo="https://raw.githubusercontent.com/TrustWallet/tokens/master/coins/60.png" priceTicker="ETH/USD" price={ethUsd} />
    <Price logo="https://raw.githubusercontent.com/TrustWallet/tokens/master/images/0x744d70fdbe2ba4cf95131626614a1763df805b9e.png" priceTicker="SNT/USD" price={sntUsd} />
  </div>
);

const mapStateToProps = state => ({
  ethUsd: getEthUsdPrice(state),
  sntUsd: getSntUsdPrice(state)
});

PriceContainer.propTypes = {
  ethUsd: PropTypes.number,
  sntUsd: PropTypes.number
};

export default connect(mapStateToProps)(PriceContainer);
