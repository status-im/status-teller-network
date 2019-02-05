import React from 'react';
import Web3 from 'web3';
import {FormFeedback} from "reactstrap";
import {NamespacesConsumer} from 'react-i18next';

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

export const isNumber = (value) => {
  if (Number.isNaN(value)) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.isNumber')}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const lowerThan = (max, value) => {
  if (value >= max) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.lowerThan', {max})}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const lowerEqThan = (max, value) => {
  if (value > max) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.lowerEqThan', {max})}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const higherThan = (min, value) => {
  if (value <= min) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.higherThan', {min})}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const higherEqThan = (min, value) => {
  if (value < min) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.higherEqThan', {min})}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const isAddress = (value) => {
  if (!Web3.utils.isAddress(value)) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.isAddress')}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const isJSON = (value) => {
  try {
    JSON.parse(value);
  } catch (e) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.isJSON')}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const isEscrowPaymentSignature = (value) => {
  try {
    const signature = JSON.parse(value);
    if (!signature.escrowId || !signature.message || !signature.type) {
      return <NamespacesConsumer>
        {t => <FormFeedback className="d-block">{t('validators.isEscrowPaymentSignature')}</FormFeedback>}
      </NamespacesConsumer>;
    }
  } catch (e) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.isJSON')}</FormFeedback>}
    </NamespacesConsumer>;
  }
};
