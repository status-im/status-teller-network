import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import {action} from "@storybook/addon-actions";

import ConfirmDialog from '../../src/js/components/ConfirmDialog';

storiesOf('Components/ConfirmDialog', module)
  .addDecorator(withKnobs)
  .add(
    "Default",
    withInfo({inline: true})(() => (
      <ConfirmDialog onCancel={action('cancel-dialog')}
                     onConfirm={action('confirm-dialog')}
                     title={text("title", "the title")}
                     content={text("content", "the content")}
                     display={boolean('display', true)}
      />
    ))
  );
