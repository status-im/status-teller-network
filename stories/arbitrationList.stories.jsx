import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from '@storybook/addon-actions';
import moment from 'moment';

import ArbitrationList from '../app/js/components/tmp/ArbitrationList';

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
    amount: 8,
    arbitration: {open: true, result: "0", openBy: "0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d" },
    expirationTime: moment(Date.now() - 60000),
    rating: 0,
    paid: true,
    released: false,
    canceled: false
  },
  {
    escrowId: 0,
    buyer: '0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d',
    seller: '0xB8D851486d1C953e31A44374ACa11151D49B8bb3',
    amount: 8,
    arbitration: {open: true, result: "1"},
    expirationTime: moment(Date.now() - 60000),
    rating: 0,
    paid: true,
    released: false,
    canceled: false
  },
  {
    escrowId: 0,
    buyer: '0xBa31E1a4Ce37FE67DcAEa7950D379CB89A36867d',
    seller: '0xB8D851486d1C953e31A44374ACa11151D49B8bb3',
    amount: 8,
    arbitration: {open: true, result: "2"},
    expirationTime: moment(Date.now() - 60000),
    rating: 0,
    paid: true,
    released: false,
    canceled: false
  }
];

const info = {inline: true};

storiesOf('ArbitrationList', module)
  .add(
    "List with disputes",
    withInfo(info)(() => (
      <ArbitrationList escrows={escrows} resolveDispute={action("resolve-dispute")}
                  loading={false} error={false}/>
    ))
  )
  .add(
    "Loading List",
    withInfo(info)(() => (
      <ArbitrationList escrows={escrows} resolveDispute={action("resolve-dispute")}
                  loading={true} error={false}/>
    ))
  )
  .add(
    "Loading List + Hash",
    withInfo(info)(() => (
      <ArbitrationList escrows={escrows} resolveDispute={action("resolve-dispute")}
                  loading={true} error={false} txHash="0xd152ad280723b7b275ff4da1eb8afa09e99077beef253a387f7bc1c61e826230"/>
    ))
  )
  .add(
    "Error doing something",
    withInfo(info)(() => (
      <ArbitrationList escrows={escrows} resolveDispute={action("resolve-dispute")}
                  loading={false} error="This is an error message"/>
    ))
  )
  .add(
    "Empty list",
    withInfo(info)(() => (
      <ArbitrationList escrows={[]} resolveDispute={action("resolve-dispute")}
                  loading={false} error={false}/>
    ))
  );
