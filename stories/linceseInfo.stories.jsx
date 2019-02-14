import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import { withKnobs, number } from '@storybook/addon-knobs';

import LicenseInfo from '../app/js/components/License/LicenseInfo';

storiesOf('LicenseInfo', module)
  .addDecorator(withKnobs)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <LicenseInfo price={number('Price', 10)}/>
    ))
  );
