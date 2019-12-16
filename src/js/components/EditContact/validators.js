import React from 'react';
import {FormFeedback} from "reactstrap";
import {Translation} from 'react-i18next';

export const contactCodeRegExp = /^0x[0-9a-fA-F]{130}$/;

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

export const isContactCode = (value, props) => {
  const isStatus = props['data-is-status'];
  if (!isStatus) {
    return;
  }
  if (!(validENS(value) || (value.startsWith("0x") && contactCodeRegExp.test(value)))){
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.isContactCode')}</FormFeedback>}
      </Translation>;
  }
};

export const required = (value) => {
  if (!value.toString().trim().length) {
    return <Translation>
      {t => <FormFeedback className="d-block">{t('validators.required')}</FormFeedback>}
    </Translation>;
  }
};

