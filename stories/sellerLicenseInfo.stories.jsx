import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import SellerLicenseInfo from '../app/js/components/Seller/SellerLicenseInfo';

storiesOf('SellerLicenseInfo', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <SellerLicenseInfo />
    ))
  );
