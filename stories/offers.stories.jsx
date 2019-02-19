import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Offers from '../app/js/components/Profile/Offers';

storiesOf('Offers', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <Offers location="London" offers={
        [
          {
            asset: '0x0',
            currency: 'EUR',
            paymentMethodsForHuman: ['Credit Card'],
            rate: '1% Above Bitfinex'
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
