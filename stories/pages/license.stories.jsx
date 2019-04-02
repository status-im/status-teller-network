import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {withKnobs, boolean, text} from '@storybook/addon-knobs';
import {action} from "@storybook/addon-actions";

import BuyButton from '../../src/js/pages/License/components/BuyButton';
import Info from '../../src/js/pages/License/components/Info';
import Balance from '../../src/js/pages/License/components/Balance';

storiesOf('Pages/License', module)
  .addDecorator(withKnobs)
  .add(
    "Buy Button",
    withInfo({inline: true})(() => (
      <BuyButton disabled={boolean('disabled', false)} onClick={action('buy-license')}/>
    ))
  )
  .add(
    "Info",
    withInfo({inline: true})(() => (
      <Info price={text('Price', '10')}/>
    ))
  )
  .add(
    "Balance",
    withInfo({inline: true})(() => (
      <Balance value={text('value', 10)}/>
    ))
  );
