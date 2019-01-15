import React from 'react';
import web3 from 'Embark/web3';
import {FormFeedback} from "reactstrap";
import {NamespacesConsumer } from 'react-i18next';

export const required = (value) => {
  if (!value.toString().trim().length) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.required')}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const isInteger = (value) => {
  value = parseFloat(value);
  if (!Number.isInteger(value)) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.isInteger')}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const isAddress = (value) => {
  if (!web3.utils.isAddress(value)) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.isAddress')}</FormFeedback>}
    </NamespacesConsumer>;
  }
};
