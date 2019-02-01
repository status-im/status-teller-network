import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import SellerPaymentMethod from '../../app/js/components/Seller/SellerPaymentMethod';
import {action} from "@storybook/addon-actions";

const methods = ['Cash (In person)', 'Bank Transfer', 'International wire'];

storiesOf('Payment Methods', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <SellerPaymentMethod methods={methods} togglePaymentMethod={action('toggle-method')} selectedMethods={[]} />
    ))
  )
  .add(
    "Selected",
    withInfo({inline: true})(() => (
      <SellerPaymentMethod methods={methods} togglePaymentMethod={action('toggle-method')} selectedMethods={[1, 2]} />
    ))
  );
