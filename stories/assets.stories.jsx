import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import SellerAssets from '../app/js/components/Seller/SellerAssets';
import {action} from "@storybook/addon-actions";

storiesOf('Assets', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <SellerAssets selectedAsset={null} assets={['ETH', 'SNT']} selectAsset={action("select-asset")}/>
    ))
  )
  .add(
    "Selected",
    withInfo({inline: true})(() => (
      <SellerAssets selectedAsset={1} assets={['ETH', 'SNT']} selectAsset={action("select-asset")}/>
    ))
  );
