import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import FiatSelectorForm from '../../app/js/components/Seller/FiatSelectorForm';
import {action} from "@storybook/addon-actions";

const CURRENCY_DATA = [
  {id: 'USD', label: 'United States Dollar - USD'},
  {id: 'EUR', label: 'Euro - EUR'},
  {id: 'GBP', label: 'Pound sterling - GBP'},
  {id: 'JPY', label: 'Japanese Yen - JPY'},
  {id: 'CNY', label: 'Chinese Yuan - CNY'},
  {id: 'KRW', label: 'South Korean Won - KRW'}
];

storiesOf('Fiat selector', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <FiatSelectorForm changeFiat={action('change-fiat')} currencies={CURRENCY_DATA} value={{}}/>
    ))
  )
  .add(
    "Selected",
    withInfo({inline: true})(() => (
      <FiatSelectorForm changeFiat={action('change-fiat')} currencies={CURRENCY_DATA} value={CURRENCY_DATA[1]}/>
    ))
  );
