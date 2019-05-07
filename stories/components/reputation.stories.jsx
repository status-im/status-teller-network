import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";

import Reputation from '../../src/js/components/Reputation';

storiesOf('Components/Reputation', module)
  .add(
    "Default",
    withInfo({inline: true})(() => (
      <Reputation reputation={{upCount: 1, downCount: 2}}/>
    ))
  )
  .add(
    "Small",
    withInfo({inline: true})(() => (
      <Reputation reputation={{upCount: 1, downCount: 2}} size="s"/>
    ))
  )
  .add(
    "After trade",
    withInfo({inline: true})(() => (
      <Reputation trade={{rating: 0, escrowId: 1}} rateTransaction={action('rate-trade')}/>
    ))
  )
  .add(
    "After trade rated",
    withInfo({inline: true})(() => (
      <Reputation trade={{rating: 5, escrowId: 1}} />
    ))
  );

