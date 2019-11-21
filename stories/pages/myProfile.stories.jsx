import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {withKnobs} from '@storybook/addon-knobs';

import Offers from '../../src/js/pages/MyOffers/components/Offers';
import Trades from '../../src/js/pages/MyTrades/components/Trades';

storiesOf('Pages/MyProfile', module)
  .addDecorator(withKnobs)
  .add(
    "With Offers",
    withInfo({inline: true})(() => (
      <Offers location="London" offers={
        [
          {
            asset: '0x0',
            token: { symbol: 'ETH' },
            currency: 'EUR',
            paymentMethodsForHuman: ['Bank Transfer'],
            rate: '1% Above Bitfinex'
          }
        ]
      } />
    ))
  )
  .add(
    "Without Offers",
    withInfo({inline: true})(() => (
      <Offers location="London" offers={[]}/>
    ))
  )
  .add(
    "With Trades",
    withInfo({inline: true})(() => (
      <Trades trades={[
        {
        address: 'address', name: 'Name', value: '2', status: 'open', buyerInfo: {
            statusContactCode: '0x0fwefwef43f3qg43g', username: 'Bob'
        },
        token: {symbol: 'ETH'}
      }
      ]}/>
    ))
  )
  .add(
    "Without Trades",
    withInfo({inline: true})(() => (
      <Trades trades={[]} />
    ))
  );
