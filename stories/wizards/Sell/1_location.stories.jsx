import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";

import SellerPosition from '../../../src/js/wizards/Sell/3_Location/components/SellerPosition';

storiesOf('Wizards/Sell/3_Location', module)
  .add(
    "Without default location",
    withInfo({inline: true})(() => (
      <SellerPosition changeLocation={action("change-location")} location="" />
    ))
  )
  .add(
    "With default location",
    withInfo({inline: true})(() => (
      <SellerPosition changeLocation={action("change-location")} location="My Default" />
    ))
  );
