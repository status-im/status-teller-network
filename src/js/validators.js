import React from 'react';
import Web3 from 'web3';
import {FormFeedback} from "reactstrap";
import {Translation} from 'react-i18next';

export const required = (value) => {
  if (!value.toString().trim().length) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.required')}</FormFeedback>}
    </Translation>;
  }
};

export const isEmail = (value) => {
  if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/).test(value)) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.isEmail')}</FormFeedback>}
    </Translation>;
  }
};

export const conditionalRequire = (value, props) => {
  const condition = props['data-condition'];
  if (condition && !value.toString().trim().length) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.required')}</FormFeedback>}
    </Translation>;
  }
};


export const isInteger = (value) => {
  value = parseFloat(value);
  if (!Number.isInteger(value)) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.isInteger')}</FormFeedback>}
    </Translation>;
  }
};

export const isNumber = (value) => {
  if (Number.isNaN(value)) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.isNumber')}</FormFeedback>}
    </Translation>;
  }
};

export const lowerThan = (value, props) => {
  const max = props['data-maxvalue'];
  if(max === '') return;

  value = parseFloat(value);
  if (value >= max) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.lowerThan', {max})}</FormFeedback>}
    </Translation>;
  }
};

export const lowerEqThan = (value, props) => {
  const max = props['data-maxvalue'];
  if(max === '') return;

  value = parseFloat(value);
  if (value > max) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.lowerEqThan', {max})}</FormFeedback>}
    </Translation>;
  }
};

export const higherThan = (value, props) => {
  const min = props['data-minvalue'];
  if(min === '') return;

  value = parseFloat(value);
  if (value <= min) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.higherThan', {min})}</FormFeedback>}
    </Translation>;
  }
};

export const higherEqThan = (value, props) => {
  const min = props['data-minvalue'];
  if(min === '') return;

  value = parseFloat(value);
  if (value < min) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.higherEqThan', {min})}</FormFeedback>}
    </Translation>;
  }
};

export const isAddress = (value) => {
  if (!Web3.utils.isAddress(value)) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.isAddress')}</FormFeedback>}
    </Translation>;
  }
};

export const isJSON = (value) => {
  try {
    JSON.parse(value);
  } catch (e) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.isJSON')}</FormFeedback>}
    </Translation>;
  }
};

export const isEscrowPaymentSignature = (value) => {
  try {
    const signature = JSON.parse(value);
    if (!signature.escrowId || !signature.message || !signature.type) {
      return <Translation>
        {t => <FormFeedback className="d-block">{t('validators.isEscrowPaymentSignature')}</FormFeedback>}
      </Translation>;
    }
  } catch (e) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.isJSON')}</FormFeedback>}
    </Translation>;
  }
};
