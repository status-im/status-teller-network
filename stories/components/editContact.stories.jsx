import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {action} from "@storybook/addon-actions";

import EditContact from '../../app/js/components/EditContact';

storiesOf('Components/EditContact', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <EditContact username=""
                   statusContactCode=""
                   isStatus={true}
                   changeUsername={action('change-username')}
                   changeContactCode={action('change-contactCode')}/>
    ))
  )
  .add(
    "Values",
    withInfo({inline: true})(() => (
      <EditContact username="User Names"
                   isStatus={true}
                   statusContactCode="123456789"
                   changeUsername={action('change-nickname')}
                   changeContactCode={action('change-contactCode')}/>
    ))
  );
