import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import SellerPosition from '../app/js/components/Seller/SellerPosition';
import {action} from "@storybook/addon-actions";

storiesOf('Location', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <SellerPosition changeLocation={action("change-location")} location="" />
    ))
  )
  .add(
    "With default position",
    withInfo({inline: true})(() => (
      <SellerPosition changeLocation={action("change-location")} location="My Default" />
    ))
  );
