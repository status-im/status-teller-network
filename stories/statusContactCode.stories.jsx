import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import statusContactCode from '../app/js/components/statusContactCode';

storiesOf('statusContactCode', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <statusContactCode value="0xlsakjd123123" />
    ))
  );

