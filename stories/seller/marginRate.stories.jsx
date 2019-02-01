import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import MarginSelectorForm from '../../app/js/components/Seller/MarginSelectorForm';
import {action} from "@storybook/addon-actions";

storiesOf('Margin selector', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <MarginSelectorForm margin={{rate: null, isAbove: true}} fiat={{id: 'USD', label: 'United States Dollar - USD'}} onMarginChange={action('margin-change')}/>
    ))
  )
  .add(
    "Selected rate",
    withInfo({inline: true})(() => (
      <MarginSelectorForm margin={{rate: 12, isAbove: false}} fiat={{id: 'USD', label: 'United States Dollar - USD'}} onMarginChange={action('margin-change')}/>
    ))
  );
