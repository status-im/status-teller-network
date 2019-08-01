import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";

import SellerPaymentMethod from '../../../src/js/wizards/Sell/1_PaymentMethods/components/SellerPaymentMethod';

const methods = ['Cash (In person)', 'Bank Transfer', 'International wire'];

storiesOf('Wizards/Sell/1_PaymentMethods', module)
  .add(
    "Not Selected",
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
