import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import StatusContractCode from '../app/js/components/StatusContractCode';

storiesOf('StatusContractCode', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <StatusContractCode value="0xlsakjd123123" />
    ))
  );

