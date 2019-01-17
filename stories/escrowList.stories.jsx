import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from '@storybook/addon-actions';
import cloneDeep from 'clone-deep';
import moment from 'moment';

import EscrowList from '../app/js/components/EscrowList';

global.web3 = {
  eth: {
    defaultAccount: '0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d'
  }
};

const escrows = [
  {
    escrowId: 0,
    buyer: '0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d',
    seller: '0xB8D851486d1C953e31A44374ACa11151D49B8bb3',
    amount: 5,
    expirationTime: moment(Date.now() + 60000),
    rating: 4,
    released: true,
    canceled: false
  },
  {
    escrowId: 1,
    buyer: '0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d',
    seller: '0xB8D851486d1C953e31A44374ACa11151D49B8bb3',
    amount: 6,
    expirationTime: moment(Date.now() + 60000),
    rating: 0,
    released: false,
    canceled: false
  },
  {
    escrowId: 2,
    buyer: '0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d',
    seller: '0xB8D851486d1C953e31A44374ACa11151D49B8bb3',
    amount: 2,
    expirationTime: moment(Date.now() - 60000),
    rating: 0,
    released: false,
    canceled: false
  },
  {
    escrowId: 3,
    buyer: '0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d',
    seller: '0xB8D851486d1C953e31A44374ACa11151D49B8bb3',
    amount: 8,
    expirationTime: moment(Date.now() - 60000),
    rating: 0,
    released: false,
    canceled: true
  }
];

const sellerEscrows = cloneDeep(escrows);

sellerEscrows.forEach(escrow => {
  const buyer = escrow.buyer;
  escrow.buyer = escrow.seller;
  escrow.seller = buyer;
});

storiesOf('EscrowList', module)
  .add(
    "Buyer List",
    withInfo({inline: true})(() => (
      <EscrowList escrows={escrows} releaseEscrow={action("release-escrow")}
                  cancelEscrow={action("cancel-escrow")} rateTransaction={action("rate-escrow")}
                  loading={false} error={false}/>
    ))
  )
  .add(
    "Seller List",
    withInfo({inline: true})(() => (
      <EscrowList escrows={sellerEscrows} releaseEscrow={action("release-escrow")}
                  cancelEscrow={action("cancel-escrow")} rateTransaction={action("rate-escrow")}
                  loading={false} error={false}/>
    ))
  )
  .add(
    "Loading List",
    withInfo({inline: true})(() => (
      <EscrowList escrows={[]} releaseEscrow={action("release-escrow")}
                  cancelEscrow={action("cancel-escrow")} rateTransaction={action("rate-escrow")}
                  loading={true} error={false}/>
    ))
  )
  .add(
    "Error doing something",
    withInfo({inline: true})(() => (
      <EscrowList escrows={escrows} releaseEscrow={action("release-escrow")}
                  cancelEscrow={action("cancel-escrow")} rateTransaction={action("rate-escrow")}
                  loading={false} error="Error releasing or something"/>
    ))
  )
  .add(
    "Empty list",
    withInfo({inline: true})(() => (
      <EscrowList escrows={[]} releaseEscrow={action("release-escrow")}
                  cancelEscrow={action("cancel-escrow")} rateTransaction={action("rate-escrow")}
                  loading={false} error={false}/>
    ))
  );
