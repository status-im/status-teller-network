import React from 'react';
import {Card, CardHeader, CardBody, CardTitle, Button, Alert} from 'reactstrap';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

const BuyLicense = (props) => (
  <Button onClick={props.buyLicense} disabled={props.disabled}>{props.t('license.buy')}</Button>
);

BuyLicense.propTypes = {
  t: PropTypes.func,
  buyLicense: PropTypes.func,
  disabled: PropTypes.bool
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
      {props.loading && <p><FontAwesomeIcon icon={faSpinner} className="loading"/>{props.t('license.buying')}</p>}
      {props.error && <Alert color="danger">{props.error}</Alert>}
      {props.isLicenseOwner ? <IsLicenseOwner t={props.t}/> : <BuyLicense buyLicense={props.buyLicense} t={props.t} disabled={props.loading}/>}
      {props.isLicenseOwner &&
        <p>{props.t('license.rating')} {props.userRating ? props.userRating : props.t('license.noRating')}</p>
      }
    </CardBody>
  </Card>
);

License.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  isLicenseOwner: PropTypes.bool,
  loading: PropTypes.bool,
  userRating: PropTypes.number,
  buyLicense: PropTypes.func
};

export default withNamespaces()(License);
