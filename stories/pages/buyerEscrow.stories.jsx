import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";

import CardEscrowBuyer from '../../src/js/pages/Escrow/components/CardEscrowBuyer';
import escrowFeature from '../../src/js/features/escrow';
const tradeStates = escrowFeature.helpers.tradeStates;

const BASE_TRADE = {
  seller: {
    statusContactCode: '0xdifjq03gjq0gerqgraegprpgaregp'
  }
};

storiesOf('Pages/BuyerEscrow', module)
  .add(
    "1 - Waiting",
    withInfo({inline: true})(() => (
      <CardEscrowBuyer trade={Object.assign({}, BASE_TRADE, {status: tradeStates.waiting})} />
    ))
  )
  .add(
    "2 - Funded",
    withInfo({inline: true})(() => (
      <CardEscrowBuyer trade={Object.assign({}, BASE_TRADE, {status: tradeStates.funded})} payAction={action('pay')} />
    ))
  )
  .add(
    "3 - Pending",
    withInfo({inline: true})(() => (
      <CardEscrowBuyer trade={Object.assign({}, BASE_TRADE, {status: tradeStates.paid})} payStatus="pending" />
    ))
  )
  .add(
    "4 - Waiting release",
    withInfo({inline: true})(() => (
      <CardEscrowBuyer trade={Object.assign({}, BASE_TRADE, {status: tradeStates.paid})} payStatus="success" />
    ))
  )
  .add(
    "5 - Released",
    withInfo({inline: true})(() => (
      <CardEscrowBuyer trade={Object.assign({}, BASE_TRADE, {status: tradeStates.released, rating: "0"})}
                       payStatus="success" rateTransaction={action('rate')} />
    ))
  )
  .add(
    "5.1 - Rated",
    withInfo({inline: true})(() => (
      <CardEscrowBuyer trade={Object.assign({}, BASE_TRADE, {status: tradeStates.released, rating: "5"})}
                       payStatus="success" rateTransaction={action('rate')} />
    ))
  )
  .add(
    "Canceled",
    withInfo({inline: true})(() => (
      <CardEscrowBuyer trade={Object.assign({}, BASE_TRADE, {status: tradeStates.canceled})} />
    ))
  );
