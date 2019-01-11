import React from 'react';
import {Card, CardHeader, CardBody, CardTitle, Button, Alert} from 'reactstrap';
import PropTypes from 'prop-types';

const BuyLicense = (props) => (
  <Button onClick={props.buyLicense}>Buy License</Button>
);
BuyLicense.propTypes = {
  buyLicense: PropTypes.func
};

const IsLicenseOwner = () => <p>You already own a license</p>;

const License = (props) => (
  <Card className="mt-2">
    <CardHeader>
      <CardTitle>License</CardTitle>
    </CardHeader>
    <CardBody>
      {props.error && <Alert color="danger">{this.props.error}</Alert>}
      {props.isLicenseOwner ? <IsLicenseOwner/> : <BuyLicense buyLicense={props.buyLicense}/>}
      <p>Rating: {props.userRating ? props.userRating : '-'}</p>
    </CardBody>
  </Card>
);

License.propTypes = {
  error: PropTypes.string,
  isLicenseOwner: PropTypes.bool,
  userRating: PropTypes.number,
  rate: PropTypes.func,
  buyLicense: PropTypes.func
};

export default License;
