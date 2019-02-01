import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import ProfileInformation from '../app/js/components/ProfileInformation';

storiesOf('ProfileInformation', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <ProfileInformation />
    ))
  );

