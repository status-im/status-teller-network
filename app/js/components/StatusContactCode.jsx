import React from 'react';
import PropTypes from 'prop-types';
import {InputGroupAddon, Input, InputGroupText, InputGroup, FormGroup} from 'reactstrap';
import {Link} from "react-router-dom";
import {withNamespaces} from 'react-i18next';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQrcode} from "@fortawesome/free-solid-svg-icons";

const StatusContactCode = ({t, value}) => (
  <FormGroup className="mt-3">
    <div>
      <h3 className="d-inline-block">
        {t('statusContactCode.title')}
      </h3>
      <span className="float-right">
        <Link to="/profile/edit" className="float-right">{t('statusContactCode.edit')}</Link>
      </span>
    </div>
    <InputGroup className="full-width-input white-input">
      <Input type="text" name="contactCode" className="prepend" disabled defaultValue={value}/>
      <InputGroupAddon addonType="append">
        <InputGroupText><FontAwesomeIcon size="lg" icon={faQrcode}/></InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  </FormGroup>
);

StatusContactCode.propTypes = {
  t: PropTypes.func,
  value: PropTypes.string
};

export default withNamespaces()(StatusContactCode);
