import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import Address from '../app/js/components/Address';


storiesOf('Address', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <Address address="0x1122334455667788990011223344556677889900" compact={false} />
    ))
  )
  .add(
    "Compact",
    withInfo({inline: true})(() => (
      <Address address="0x1122334455667788990011223344556677889900" compact={true} />
    ))
  );
