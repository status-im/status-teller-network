import React from 'react';

import { storiesOf } from '@storybook/react';
import { withInfo } from "@storybook/addon-info";

import Map, {MapComponent} from '../app/js/components/Map';

const info = {inline: true, propTables: [MapComponent], propTablesExclude: [Map]};

const defaultCoords = {
  latitude: 45.492611,
  longitude: -73.617959
};

storiesOf('Map', module)
  .add(
    "Display Map with Coords",
    withInfo(info)(() => (
      <Map coords={defaultCoords}/>
    ))
  ).add(
    "Display Map when access denied",
    withInfo(info)(() => (
      <Map error={"denied access"}/>
    ))
  ).add(
    "Display Map with errors",
    withInfo(info)(() => (
      <Map error={"Something Bad Happened"}/>
    ))
  );
