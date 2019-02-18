import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, string } from '@storybook/addon-knobs';

import YourSNTBalance from '../app/js/components/YourSNTBalance';

storiesOf('YourSNTBalance', module)
  .addDecorator(withKnobs)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <YourSNTBalance value={string('value', 10)}/>
    ))
  );
