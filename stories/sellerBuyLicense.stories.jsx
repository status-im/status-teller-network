import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, boolean } from '@storybook/addon-knobs';
import {action} from "@storybook/addon-actions";

import SellerBuyLicense from '../app/js/components/Seller/SellerBuyLicense';

storiesOf('SellerBuyLicense', module)
  .addDecorator(withKnobs)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <SellerBuyLicense disabled={boolean('disabled', false)} onClick={action('buy-license')}/>
    ))
  );
