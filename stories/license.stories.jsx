import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import { withInfo } from "@storybook/addon-info";
import { action } from '@storybook/addon-actions';

import License from '../app/js/components/License';

const info = {inline: true, propTables: [License.WrappedComponent]};

const stories = storiesOf('License', module)

stories.addDecorator(withKnobs);

stories
  .add(
    "Display License",
    withInfo(info)(() => (
      <License buyLicense={action("buy-license")}/>
    ))
  )
  .add(
    "Display License when already own one (no rating)",
    withInfo({ inline: true })(() => (
      <License isLicenseOwner/>
    ))
  )
  .add(
    "Display License when already own one",
    withInfo({ inline: true })(() => (
      <License isLicenseOwner userRating={number('rating', '3')} />
    ))
  );

