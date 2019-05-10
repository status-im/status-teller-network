import React from 'react';
import Web3 from 'web3';
import {FormFeedback} from "reactstrap";
import {NamespacesConsumer} from 'react-i18next';
import {contactCodeRegExp} from './utils/address';

export const addressLikeUsername = username => {
  const length = username.length;
  const firstIsZero = username[0] === "0";
  const secondIsX = username[1].toLowerCase() === "x";
  let isAddress = false;
  if (length > 12 && firstIsZero && secondIsX) {
    username.slice(2, 7).split("").forEach(letter => {
      const code = letter.charCodeAt();
      // eslint-disable-next-line no-return-assign
      if ((code >= 48 && code <= 57) || (code >= 97 && code <= 102)) return isAddress = true;
      isAddress = false;
    });
  }
  return isAddress;
};

export const validENS = username => {
  const value = username.toLowerCase().trim();

  if (value !== username.trim()) return false;
  if (value.length < 4) return false;
  if (addressLikeUsername(value)) return false;

  return true;
};


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

export const isContactCode = (value) => {
  if (!(validENS(value) || (value.startsWith("0x") && contactCodeRegExp.test(value)))){
    return <NamespacesConsumer>
      {t => <FormFeedback className="d-block">{t('validators.isContactCode')}</FormFeedback>}
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
