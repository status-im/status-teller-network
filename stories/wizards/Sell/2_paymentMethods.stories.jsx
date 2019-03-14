import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";

import SellerPaymentMethod from '../../../app/js/wizards/Sell/3_PaymentMethods/components/SellerPaymentMethod';

const methods = ['Cash (In person)', 'Bank Transfer', 'International wire'];

storiesOf('Wizards/Sell/3_PaymentMethods', module)
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
