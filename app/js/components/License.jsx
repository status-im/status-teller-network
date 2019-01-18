import React from 'react';
import {Card, CardHeader, CardBody, CardTitle, Button, Alert} from 'reactstrap';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';

const BuyLicense = (props) => (
  <Button onClick={props.buyLicense}>{props.t('license.buy')}</Button>
);

BuyLicense.propTypes = {
  t: PropTypes.func,
  buyLicense: PropTypes.func
};

const IsLicenseOwner = (props) => <p>{props.t('license.alreadyOwner')}</p>;

IsLicenseOwner.propTypes = {
  t: PropTypes.func
};

const License = (props) => (
  <Card className="mt-2">
    <CardHeader>
      <CardTitle>{props.t('license.title')}</CardTitle>
    </CardHeader>
    <CardBody>
      {props.error && <Alert color="danger">{props.error}</Alert>}
      {props.isLicenseOwner ? <IsLicenseOwner t={props.t}/> : <BuyLicense buyLicense={props.buyLicense} t={props.t}/>}
      <p>{props.t('license.rating')} {props.userRating ? props.userRating : '-'}</p>
    </CardBody>
  </Card>
);

License.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  isLicenseOwner: PropTypes.bool,
  userRating: PropTypes.number,
  buyLicense: PropTypes.func
};

export default withNamespaces()(License);
