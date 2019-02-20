import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import SellerInformation from '../app/js/components/SellerInformation';

storiesOf('SellerInformation', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <SellerInformation address={"0x123123123"} username={"Eric"} reputation={{upCount: 432, downCount: 54}}/>
    ))
  );

