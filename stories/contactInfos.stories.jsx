import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import ContactForm from '../app/js/components/ContactForm';
import {action} from "@storybook/addon-actions";

storiesOf('Seller contact infos', module)
  .add(
    "Normal",
    withInfo({inline: true})(() => (
      <ContactForm nickname="" contactCode="" isStatus={true} changeNickname={action('change-nickname')} changeContactCode={action('change-contactCode')}/>
    ))
  )
  .add(
    "Values",
    withInfo({inline: true})(() => (
      <ContactForm nickname="Nick Names" isStatus={true} contactCode="123456789" changeNickname={action('change-nickname')} changeContactCode={action('change-contactCode')}/>
    ))
  );
