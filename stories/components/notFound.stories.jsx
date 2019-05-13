import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";
import {withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

import FourOrFour from '../../src/js/components/ErrorInformation/404';

storiesOf('Components/ErrorInformation', module)
  .addDecorator(withKnobs)
  .add(
    "404",
    withInfo({inline: true})(() => (
      <div>
        <FourOrFour />
      </div>
    ))
  );

