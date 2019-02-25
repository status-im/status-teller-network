import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";

import SellerAssets from '../../../app/js/wizards/Sell/0_Asset/components/SellerAssets';

storiesOf('Wizards/Sell/0_Asset', module)
  .add(
    "No Asset Selected",
    withInfo({inline: true})(() => (
      <SellerAssets selectedAsset={null} availableAssets={['ETH', 'SNT']} selectAsset={action("select-asset")}/>
    ))
  )
  .add(
    "Asset Selected",
    withInfo({inline: true})(() => (
      <SellerAssets selectedAsset={1} availableAssets={['ETH', 'SNT']} selectAsset={action("select-asset")}/>
    ))
  );
