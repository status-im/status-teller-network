import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, boolean } from '@storybook/addon-knobs';
import {action} from "@storybook/addon-actions";

import UpdateUser from '../app/js/components/Profile/UpdateUser';

storiesOf('UpdateUser', module)
  .addDecorator(withKnobs)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <UpdateUser disabled={boolean('disabled', false)} onClick={action('update-user')}/>
    ))
  );
