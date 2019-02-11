import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobs, number } from '@storybook/addon-knobs';
import { withInfo } from "@storybook/addon-info";
import { action } from '@storybook/addon-actions';

import License from '../app/js/components/tmp/License';

const info = {inline: true, propTables: [License.WrappedComponent]};

const stories = storiesOf('License', module);

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
  )
  .add(
    "Buying License",
    withInfo({ inline: true })(() => (
      <License loading={true}/>
    ))
  )
  .add(
    "Buying License with Hash",
    withInfo({ inline: true })(() => (
      <License loading={true} txHash="0xd152ad280723b7b275ff4da1eb8afa09e99077beef253a387f7bc1c61e826230"/>
    ))
  );

