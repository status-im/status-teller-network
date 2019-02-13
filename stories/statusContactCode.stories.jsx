import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import StatusContactCode from '../app/js/components/StatusContactCode';

storiesOf('StatusContactCode', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <StatusContactCode value="0xlsakjd123123" />
    ))
  );

