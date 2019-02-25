import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

import ErrorInformation from '../../app/js/components/ErrorInformation';

storiesOf('Components/ErrorInformation', module)
  .addDecorator(withKnobs)
  .add(
    "provider",
    withInfo({inline: true})(() => (
      <ErrorInformation provider/>
    ))
  )
  .add(
    "network",
    withInfo({inline: true})(() => (
      <ErrorInformation network/>
    ))
  )
  .add(
    "transaction",
    withInfo({inline: true})(() => (
      <ErrorInformation transaction retry={action("retry")}/>
    ))
  );

