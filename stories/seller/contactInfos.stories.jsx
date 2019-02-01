import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import SellerContact from '../../app/js/components/Seller/SellerContact';
import {action} from "@storybook/addon-actions";

storiesOf('Seller contact infos', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <SellerContact nickname="" contactCode="" changeNickname={action('change-nickname')} changeContactCode={action('change-contactCode')}/>
    ))
  )
  .add(
    "Values",
    withInfo({inline: true})(() => (
      <SellerContact nickname="Nick Names" contactCode="123456789" changeNickname={action('change-nickname')} changeContactCode={action('change-contactCode')}/>
    ))
  );
