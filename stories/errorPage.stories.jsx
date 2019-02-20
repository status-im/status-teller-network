import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs } from '@storybook/addon-knobs';

import ErrorPage from '../app/js/components/ErrorPage';

storiesOf('Error Page', module)
  .addDecorator(withKnobs)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <ErrorPage error="Error with something"/>
    ))
  )
  .add(
    "With tip",
    withInfo({inline: true})(() => (
      <ErrorPage error="Error with something" tip="You can do this to fix this error"/>
    ))
  )
  .add(
    "With repeat",
    withInfo({inline: true})(() => (
      <ErrorPage error="Error with something" canRepeat={true}/>
    ))
  )
  .add(
    "With tip and repeat",
    withInfo({inline: true})(() => (
      <ErrorPage error="Error with something" tip="You can do this to fix this error" canRepeat={true}/>
    ))
  );
