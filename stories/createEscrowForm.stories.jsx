import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from '@storybook/addon-actions';

import CreateEscrowForm from '../app/js/components/CreateEscrowForm';

const info = {inline: true, propTables: [CreateEscrowForm.WrappedComponent]};
storiesOf('CreateEscrowForm', module)
  .add(
    "Empty Form",
    withInfo(info)(() => (
      <CreateEscrowForm create={action("create-escrow")} result={null} error=""/>
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
