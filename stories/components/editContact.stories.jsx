import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";
import { withKnobs, text, boolean } from '@storybook/addon-knobs';

import EditContact from '../../src/js/components/EditContact';

storiesOf('Components/EditContact', module)
  .addDecorator(withKnobs)
  .add(
    "default",
    withInfo({inline: true})(() => (
      <EditContact username=""
                   statusContactCode=""
                   isStatus={true}
                   changeUsername={action('change-username')}
                   changeContactCode={action('change-contactCode')}/>
    ))
  )
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <EditContact username={text('username', "john")}
                   isStatus={boolean('isStatus', true)}
                   statusContactCode={text('statusContactCode', "123456789")}
                   changeUsername={action('change-nickname')}
                   changeContactCode={action('change-contactCode')}/>
    ))
  )
  .add(
    "With Status ENS username",
    withInfo({inline: true})(() => (
      <EditContact username={text('username', "john")}
                   isStatus={boolean('isStatus', true)}
                   statusContactCode={text('statusContactCode', "john.stateofus.eth")}
                   changeUsername={action('change-nickname')}
                   changeContactCode={action('change-contactCode')}/>
  ))
);
