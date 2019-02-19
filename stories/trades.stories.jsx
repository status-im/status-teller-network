import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Trades from '../app/js/components/Profile/Trades';

storiesOf('Trades', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <Trades trades={[{address: 'address', name: 'Name', value: '2', status: 'open'}]}/>
    ))
  )
  .add(
    "Empty",
    withInfo({inline: true})(() => (
      <Trades trades={[]} />
    ))
  );
