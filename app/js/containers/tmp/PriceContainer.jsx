import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import Price from '../../components/tmp/Price';

import { getEthUsdPrice, getSntUsdPrice, hasPricesError } from '../../features/prices/reducer';

const PriceContainer = ({ ethUsd, sntUsd, hasErrors, t }) => (
  <div>
    {hasErrors &&
      <p>{t('price.fetchError')}</p>
    }
    {!hasErrors &&
      <div>
        <Price logo="https://raw.githubusercontent.com/TrustWallet/tokens/master/coins/60.png" priceTicker="ETH/USD" price={ethUsd} />
        <Price logo="https://raw.githubusercontent.com/TrustWallet/tokens/master/images/0x744d70fdbe2ba4cf95131626614a1763df805b9e.png" priceTicker="SNT/USD" price={sntUsd} />
      </div>
    }
  </div>
);

const mapStateToProps = state => ({
  ethUsd: getEthUsdPrice(state),
  sntUsd: getSntUsdPrice(state),
  hasErrors: hasPricesError(state)
});

PriceContainer.propTypes = {
  t: PropTypes.func,
  ethUsd: PropTypes.number,
  sntUsd: PropTypes.number
};

export default withNamespaces()(connect(mapStateToProps)(PriceContainer));
