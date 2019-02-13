import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import LicenseInfo from '../app/js/components/License/LicenseInfo';

storiesOf('LicenseInfo', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <LicenseInfo />
    ))
  );
