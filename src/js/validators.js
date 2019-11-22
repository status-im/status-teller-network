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

export const isEmail = (value) => {
  if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/).test(value)) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.isEmail')}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const conditionalRequire = (value, props) => {
  const condition = props['data-condition'];
  if (condition && !value.toString().trim().length) {
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

export const lowerThan = (value, props) => {
  const max = props['data-maxvalue'];
  if(max === '') return;

  value = parseFloat(value);
  if (value >= max) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.lowerThan', {max})}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const lowerEqThan = (value, props) => {
  const max = props['data-maxvalue'];
  if(max === '') return;

  value = parseFloat(value);
  if (value > max) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.lowerEqThan', {max})}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const higherThan = (value, props) => {
  const min = props['data-minvalue'];
  if(min === '') return;

  value = parseFloat(value);
  if (value <= min) {
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.higherThan', {min})}</FormFeedback>}
    </NamespacesConsumer>;
  }
};

export const higherEqThan = (value, props) => {
  const min = props['data-minvalue'];
  if(min === '') return;

  value = parseFloat(value);
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
