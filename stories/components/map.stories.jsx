import React from 'react';

import { storiesOf } from '@storybook/react';
import { withInfo } from "@storybook/addon-info";

import Map, { Map as MapWrapped } from '../../src/js/components/Map';

const info = {inline: true, propTables: [MapWrapped]};

const defaultCoords = {
  latitude: 45.492611,
  longitude: -73.617959
};

storiesOf('Components/Map', module)
  .add(
    "With Coords",
    withInfo(info)(() => (
      <Map coords={defaultCoords}/>
    ))
  ).add(
    "When access denied",
    withInfo(info)(() => (
      <Map error={"denied access"}/>
    ))
  ).add(
    "With errors",
    withInfo(info)(() => (
      <Map error={"Something Bad Happened"}/>
    ))
  );
