import React from 'react';

import { storiesOf } from '@storybook/react';
import { withInfo } from "@storybook/addon-info";
import { action } from '@storybook/addon-actions';

import Price from '../app/js/components/Price';

storiesOf('Price', module)
  .add(
    "Display Price",
    withInfo({ inline: true })(() => (
      <Price logo="https://raw.githubusercontent.com/TrustWallet/tokens/master/coins/60.png" priceTicker="ETH/USD" price="1.23" />
    ))
  );
