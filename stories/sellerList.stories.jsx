import React from 'react';

import { storiesOf } from '@storybook/react';
import { withInfo } from "@storybook/addon-info";

import SellerList from '../app/js/components/SellerList';

const owners = [
  {
    address: '0xB8D851486d1C953e31A44374ACa11151D49B8bb3'
  },
  {
    address: '0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d'
  }
];

storiesOf('SellerList', module)
  .add(
    "Seller List",
    withInfo({ inline: true })(() => (
      <SellerList licenseOwners={owners} licenseOwnersError={false}/>
    ))
  )
  .add(
    "List error",
    withInfo({ inline: true })(() => (
      <SellerList licenseOwners={[]} licenseOwnersError="Error loading"/>
    ))
  );
