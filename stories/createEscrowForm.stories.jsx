import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from '@storybook/addon-actions';

import CreateEscrowForm from '../app/js/components/tmp/CreateEscrowForm';

const info = {inline: true, propTables: [CreateEscrowForm.WrappedComponent]};
storiesOf('CreateEscrowForm', module)
  .add(
    "Empty Form",
    withInfo(info)(() => (
      <CreateEscrowForm create={action("create-escrow")} result={null} error=""/>
    ))
  )
  .add(
    "Loading Form",
    withInfo(info)(() => (
      <CreateEscrowForm create={action("create-escrow")} result={null} error="" isLoading={true}/>
    ))
  )
  .add(
    "Loading Form + Tx Hash",
    withInfo(info)(() => (
      <CreateEscrowForm create={action("create-escrow")} result={null} error="" isLoading={true}
                        txHash="0xd152ad280723b7b275ff4da1eb8afa09e99077beef253a387f7bc1c61e826230"/>
    ))
  )
  .add(
    "Form with error",
    withInfo(info)(() => (
      <CreateEscrowForm create={action("create-escrow")} result={null} error="Error while creating"/>
    ))
  )
  .add(
    "Form with result",
    withInfo(info)(() => (
      <CreateEscrowForm create={action("create-escrow")} result={{id: 0, value: 'very good'}} error=""/>
    ))
  );
