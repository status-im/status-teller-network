import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, boolean } from '@storybook/addon-knobs';
import {action} from "@storybook/addon-actions";

import LicenseBuy from '../app/js/components/License/LicenseBuy';

storiesOf('LicenseBuy', module)
  .addDecorator(withKnobs)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <LicenseBuy disabled={boolean('disabled', false)} onClick={action('buy-license')}/>
    ))
  );
