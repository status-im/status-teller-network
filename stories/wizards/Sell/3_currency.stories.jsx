import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";

import FiatSelectorForm from '../../../src/js/wizards/Sell/2_Currency/components/FiatSelectorForm';

const CURRENCY_DATA = [
  {id: 'USD', label: 'United States Dollar - USD'},
  {id: 'EUR', label: 'Euro - EUR'},
  {id: 'GBP', label: 'Pound sterling - GBP'},
  {id: 'JPY', label: 'Japanese Yen - JPY'},
  {id: 'CNY', label: 'Chinese Yuan - CNY'},
  {id: 'KRW', label: 'South Korean Won - KRW'}
];

storiesOf('Wizards/Sell/4_Currency', module)
  .add(
    "Not Selected",
    withInfo({inline: true})(() => (
      <FiatSelectorForm changeCurrency={action('change-currency')} currencies={CURRENCY_DATA} value={""}/>
    ))
  )
  .add(
    "Selected",
    withInfo({inline: true})(() => (
      <FiatSelectorForm changeCurrency={action('change-currency')} currencies={CURRENCY_DATA} value={CURRENCY_DATA[1].id}/>
    ))
  );
