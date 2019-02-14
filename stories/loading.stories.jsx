import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Loading from '../app/js/components/ui/Loading';

storiesOf('Loading', module)
  .add(
    "Mining",
    withInfo({inline: true})(() => (
      <Loading mining />
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
