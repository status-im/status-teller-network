import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Loading from '../../src/js/components/Loading';

storiesOf('Components/Loading', module)
  .add(
    "Mining",
    withInfo({inline: true})(() => (
      <Loading mining />
    ))
  )
  .add(
    "Mining + Hash",
    withInfo({inline: true})(() => (
      <Loading mining txHash="0xcc21e58519f0c048267b020911d3f6822ffd63a5b1ce7ea4c506fddfb78699ad" />
    ))
  )
  .add(
    "Page",
    withInfo({inline: true})(() => (
      <Loading page />
    ))
  )
  .add(
    "Initial",
    withInfo({inline: true})(() => (
      <Loading initial />
    ))
  );
