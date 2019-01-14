import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from '@storybook/addon-actions';

import CreateEscrowForm from '../app/js/components/CreateEscrowForm';


storiesOf('CreateEscrowForm', module)
  .add(
    "Empty Form",
    withInfo({inline: true})(() => (
      <CreateEscrowForm create={action("create-escrow")} result={null} error=""/>
    ))
  )
  .add(
    "Form with error",
    withInfo({inline: true})(() => (
      <CreateEscrowForm create={action("create-escrow")} result={null} error="Error while creating"/>
    ))
  )
  .add(
    "Form with result",
    withInfo({inline: true})(() => (
      <CreateEscrowForm create={action("create-escrow")} result={{id: 0, value: 'very good'}} error=""/>
    ))
  );
