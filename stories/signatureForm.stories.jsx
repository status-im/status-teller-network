import React from 'react';

import {storiesOf} from '@storybook/react';
import {withInfo} from "@storybook/addon-info";

import IncludeSignatureForm from '../app/js/components/tmp/IncludeSignatureForm';

const info = {inline: true, propTables: [IncludeSignatureForm.WrappedComponent]};

storiesOf('Signature Form', module)
  .add(
    "Empty Form",
    withInfo(info)(() => (
      <IncludeSignatureForm />
    ))
  )
  .add(
    "Form Loading",
    withInfo(info)(() => (
      <IncludeSignatureForm loading={true} />
    ))
  )
  .add(
    "Form Loading + Hash",
    withInfo(info)(() => (
      <IncludeSignatureForm loading={true} txHash="0xd152ad280723b7b275ff4da1eb8afa09e99077beef253a387f7bc1c61e826230" />
    ))
  )
  .add(
    "Form Success",
    withInfo(info)(() => (
      <IncludeSignatureForm loading={false} txHash="0xd152ad280723b7b275ff4da1eb8afa09e99077beef253a387f7bc1c61e826230"
                            receipt={{cool: 'it worked'}} />
    ))
  );
