import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Mining from '../../src/js/pages/Escrow/components/Mining';

storiesOf('Components/Mining', module)
  .add(
    "Mining",
    withInfo({inline: true})(() => (
      <Mining />
    ))
  )
  .add(
    "Mining + Hash",
    withInfo({inline: true})(() => (
      <Mining txHash="0xcc21e58519f0c048267b020911d3f6822ffd63a5b1ce7ea4c506fddfb78699ad" />
    ))
  );
