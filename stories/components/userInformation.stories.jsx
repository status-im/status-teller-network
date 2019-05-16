import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, text, boolean } from '@storybook/addon-knobs';

import UserInformation from '../../src/js/components/UserInformation';
import Address from '../../src/js/components/UserInformation/Address';

storiesOf('Components/UserInformation', module)
.addDecorator(withKnobs)
  .add(
    "Default",
    withInfo({inline: true})(() => (
      <UserInformation identiconSeed={"0x04c3189dd7c10a6211432a254508aa7da0f4cb35ec8ac690d403427666793e36003c4b615053b633d387561a55bbe2e91d4d39911fa52a0f9933f659d059aa0f3e"} username={"Eric"} reputation={{upCount: 432, downCount: 54}}/>
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
