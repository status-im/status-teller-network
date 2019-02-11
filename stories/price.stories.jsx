import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import { withInfo } from "@storybook/addon-info";

import Price from '../app/js/components/tmp/Price';

const stories = storiesOf('Price', module);

stories.addDecorator(withKnobs);

stories.add(
    "Display Price",
    withInfo({ inline: true })(() => (
      <Price logo={text('logo', "https://raw.githubusercontent.com/TrustWallet/tokens/master/coins/60.png")} priceTicker={text('ticker name', "ETH/USD")} price={number('price', 1.23)} />
    )),
);
