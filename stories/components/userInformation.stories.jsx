import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, text, boolean } from '@storybook/addon-knobs';

import UserInformation from '../../app/js/components/UserInformation';
import Address from '../../app/js/components/UserInformation/Address';

storiesOf('Components/UserInformation', module)
.addDecorator(withKnobs)
  .add(
    "Default",
    withInfo({inline: true})(() => (
      <UserInformation address={"0x123123123"} username={"Eric"} reputation={{upCount: 432, downCount: 54}}/>
    ))
  )
  .add(
    "Address",
    withInfo({inline: true})(() => (
      <Address address={text('Address', "0x1122334455667788990011223344556677889900")} compact={boolean('Compact', false)} />
    ))
  )
  .add(
    "Address Compact",
    withInfo({inline: true})(() => (
      <Address address={text('Address', "0x1122334455667788990011223344556677889900")} compact={boolean('Compact', true)} />
    ))
  );
