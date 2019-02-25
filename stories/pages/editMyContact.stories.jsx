import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {withKnobs, boolean} from '@storybook/addon-knobs';
import {action} from "@storybook/addon-actions";

import UpdateButton from '../../app/js/pages/EditMyContact/components/UpdateButton';

storiesOf('Pages/EditMyContact', module)
  .addDecorator(withKnobs)
  .add(
    "Update Button",
    withInfo({inline: true})(() => (
      <UpdateButton disabled={boolean('disabled', false)} onClick={action('update-my-contact')}/>
    ))
  );
