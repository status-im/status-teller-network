import React from 'react';

import { storiesOf } from '@storybook/react';
import { withInfo } from "@storybook/addon-info";
import { action } from '@storybook/addon-actions';

import License from '../app/js/components/License';

storiesOf('License', module)
  .add(
    "Display License",
    withInfo({ inline: true })(() => (
      <License buyLicense={action("buy-license")}/>
    ))
  ).add(
    "Display License when already own one",
    withInfo({ inline: true })(() => (
      <License isLicenseOwner/>
    ))
  );
