import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Offers from '../app/js/components/Offers';

storiesOf('Offers', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <Offers offers={
        [
          {
            from: 'ETH',
            to: 'EUR',
            type: 'Selling',
            location: 'Berlin',
            paymentMethod: 'Credit Card',
            rate: '1.5% above Bitfinex'
          }
        ]
      } />
    ))
  )
  .add(
    "Empty",
    withInfo({inline: true})(() => (
      <Offers offers={[]} />
    ))
  );
