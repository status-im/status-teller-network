import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, text, boolean } from '@storybook/addon-knobs';

import Address from '../app/js/components/Address';


storiesOf('Address', module)
  .addDecorator(withKnobs)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <Address address={text('Address', "0x1122334455667788990011223344556677889900")} compact={boolean('Compact', false)} />
    ))
  )
  .add(
    "Compact",
    withInfo({inline: true})(() => (
      <Address address={text('Address', "0x1122334455667788990011223344556677889900")} compact={boolean('Compact', true)} />
    ))
  );
