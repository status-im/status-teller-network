import React from 'react';

import { storiesOf } from '@storybook/react';
import { withInfo } from "@storybook/addon-info";

import Map from '../app/js/components/Map';

const defaultCoords = {
  latitude: 45.492611,
  longitude: -73.617959
};

storiesOf('Map', module)
  .add(
    "Display Map with Coords",
    withInfo({ inline: true })(() => (
      <Map coords={defaultCoords}/>
    ))
  ).add(
    "Display Map when access denied",
    withInfo({ inline: true })(() => (
      <Map error={"denied access"}/>
    ))
  ).add(
    "Display Map with errors",
    withInfo({ inline: true })(() => (
      <Map error={"Something Bad Happened"}/>
    ))
  );
