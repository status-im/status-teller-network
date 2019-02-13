import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Offers from '../app/js/components/Offers';

storiesOf('Offers', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <Offers location="London" offers={
        [
          {
            asset: '0x0',
            currency: 'EUR',
            paymentMethods: ['Credit Card'],
            margin: 1,
            marketType: 1
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
