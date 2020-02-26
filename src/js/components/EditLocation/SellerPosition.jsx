import React from 'react';
import {Form, FormGroup, Input, Label} from 'reactstrap';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";

const SellerPosition = ({t, changeLocation, location}) => (
  <React.Fragment>
    <h2>{t('sellerLocation.whatLocation')}</h2>
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormGroup>
        <Label className="text-small mt-3 mb-0">{t('sellerLocation.location')}</Label>
        <Input type="text" name="location" id="location" placeholder="eg. Berlin, Germany"
               value={location || ''} onChange={(e) => changeLocation(e.target.value)}/>

        <FormGroup check className="mt-3">
          <Label check>
            <Input type="checkbox" onClick={(e) => {
              if (e.target.checked) {
                changeLocation('');
              }
            }}/>
            {t('sellerLocation.hideLocation')}
          </Label>
        </FormGroup>
      </FormGroup>
    </Form>
  </React.Fragment>
);

SellerPosition.propTypes = {
  t: PropTypes.func,
  changeLocation: PropTypes.func,
  location: PropTypes.string
};


export default withTranslation()(SellerPosition);
