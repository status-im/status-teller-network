import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Reputation from '../../src/js/components/Reputation';

storiesOf('Components/Reputation', module)
  .add(
    "Default",
    withInfo({inline: true})(() => (
      <Reputation reputation={{upCount: 1, downCount: 2}} />
    ))
  );

