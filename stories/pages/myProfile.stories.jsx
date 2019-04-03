import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {withKnobs} from '@storybook/addon-knobs';

import Offers from '../../src/js/pages/MyProfile/components/Offers';
import Trades from '../../src/js/pages/MyProfile/components/Trades';
import StatusContactCode from '../../src/js/pages/MyProfile/components/StatusContactCode';

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
    "Status Contact Code",
    withInfo({inline: true})(() => (
      <StatusContactCode value="0xlsakjd123123" />
    ))
  )
  .add(
    "With Trades",
    withInfo({inline: true})(() => (
      <Trades trades={[{address: 'address', name: 'Name', value: '2', status: 'open'}]}/>
    ))
  )
  .add(
    "Without Trades",
    withInfo({inline: true})(() => (
      <Trades trades={[]} />
    ))
  );
