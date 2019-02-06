import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Reputation from '../app/js/components/Reputation';

storiesOf('Reputation', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <Reputation reputation={{upCount: 1, downCount: 2}} />
    ))
  );

